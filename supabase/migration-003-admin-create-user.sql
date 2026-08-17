-- ============================================================
-- Migration 003: create users from the admin panel
-- Security-definer RPC; only admin / CEO / ops manager / HR may call it.
-- (Already applied to the live project; kept here for history.)
-- ============================================================

create or replace function public.admin_create_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_role user_role default 'staff',
  p_department department default null,
  p_outlet_id uuid default null
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid;
begin
  if not (public.is_admin_level() or public.my_role() = 'hr') then
    raise exception 'Only admin, CEO, operations manager or HR can create users';
  end if;
  if p_email is null or p_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Invalid email address';
  end if;
  if length(coalesce(p_password, '')) < 6 then
    raise exception 'Password must be at least 6 characters';
  end if;
  if exists (select 1 from auth.users where lower(email) = lower(p_email)) then
    raise exception 'A user with this email already exists';
  end if;

  uid := gen_random_uuid();

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current
  ) values (
    '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated',
    lower(p_email), extensions.crypt(p_password, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', p_full_name),
    now(), now(), '', '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, created_at, updated_at, last_sign_in_at
  ) values (
    gen_random_uuid(), uid, uid::text,
    jsonb_build_object('sub', uid::text, 'email', lower(p_email), 'email_verified', true),
    'email', now(), now(), now()
  );

  -- the on_auth_user_created trigger has created the profile; set its details
  update public.profiles
  set full_name = coalesce(nullif(p_full_name, ''), full_name),
      role = p_role,
      department = p_department,
      outlet_id = p_outlet_id
  where id = uid;

  return uid;
end;
$$;
