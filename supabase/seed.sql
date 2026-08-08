-- ============================================================
-- Bektash Operations Platform - Seed Data
-- Run AFTER schema.sql in the Supabase SQL editor.
-- Edit outlet names/codes to match your real outlets.
-- ============================================================

-- ---------- Outlets ----------
insert into public.outlets (name, code, address) values
  ('Bektash Marad', 'MRD', 'Marad, Kochi, Kerala'),
  ('Bektash Nettoor', 'NTR', 'Intuc Junction, NH Bypass, Nettoor, Kochi'),
  ('Bektash Kakkanad', 'KKD', 'Kakkanad, Kochi, Kerala'),
  ('Bektash MG Road', 'MGR', 'MG Road, Kochi, Kerala');

-- ---------- Checklist templates ----------
-- Opening checklist (outlet team)
with t as (
  insert into public.checklist_templates (name, description, type)
  values ('Outlet Opening Checklist', 'Complete before opening for customers. Photo evidence required where marked.', 'opening')
  returning id
)
insert into public.checklist_items (template_id, position, text, requires_photo, critical)
select id, p, txt, photo, crit from t, (values
  (1,  'Unlock outlet, disarm alarm, switch on lights & signage', false, false),
  (2,  'Check CCTV cameras are all recording', false, true),
  (3,  'Staff grooming check: clean uniform, hair cover, trimmed nails, no jewellery', true, true),
  (4,  'Handwash stations stocked with soap and paper towels', true, true),
  (5,  'Check chiller/freezer temperatures and log readings (chiller 1-4°C, freezer -18°C)', true, true),
  (6,  'Inspect marinated chicken (shawarma/alfaham) - smell, colour, date labels', true, true),
  (7,  'Load shawarma spit and switch on grill (photo of loaded spit)', true, false),
  (8,  'Charcoal/grill station prepped for alfaham', true, false),
  (9,  'Burger station: buns, patties, sauces, veg prepped and in date', false, false),
  (10, 'Shake/juice station: fruits fresh, milk in date, blender sanitized', false, false),
  (11, 'FOH: tables, chairs and counters wiped and sanitized', true, false),
  (12, 'Menu boards, POS and card machine working', false, false),
  (13, 'Cash float counted and recorded', false, true),
  (14, 'Waste bins emptied, lined and lids closed', false, false),
  (15, 'Front glass, entrance and outdoor area clean (photo of storefront)', true, false)
) as v(p, txt, photo, crit);

-- Closing checklist (outlet team)
with t as (
  insert into public.checklist_templates (name, description, type)
  values ('Outlet Closing Checklist', 'Complete after last order. Photo evidence required where marked.', 'closing')
  returning id
)
insert into public.checklist_items (template_id, position, text, requires_photo, critical)
select id, p, txt, photo, crit from t, (values
  (1,  'All cooking equipment switched off (grill, fryer, shawarma machine)', true, true),
  (2,  'Leftover shawarma meat removed from spit, cooled and stored/discarded per SOP', true, true),
  (3,  'All food items labelled, dated, covered and stored in chiller', true, true),
  (4,  'Chiller/freezer temperatures logged before closing', true, true),
  (5,  'Grill, prep surfaces and slicers cleaned and sanitized', true, false),
  (6,  'Floors swept and mopped (BOH and FOH)', true, false),
  (7,  'Waste removed to outside bins, bin area clean', true, false),
  (8,  'Handwash and sanitizer stations restocked for morning', false, false),
  (9,  'Cash reconciled with POS, closing report printed', false, true),
  (10, 'Stock counts updated for key items (chicken, buns, kuboos)', false, false),
  (11, 'Gas valves closed and checked', true, true),
  (12, 'Lights, AC and signage off; CCTV left running', false, true),
  (13, 'Outlet locked and alarm armed', false, true)
) as v(p, txt, photo, crit);

-- Area manager weekly checklist
with t as (
  insert into public.checklist_templates (name, description, type)
  values ('Area Manager Weekly Visit', 'Weekly outlet inspection by the Area Manager.', 'weekly_area')
  returning id
)
insert into public.checklist_items (template_id, position, text, requires_photo, critical)
select id, p, txt, photo, crit from t, (values
  (1,  'Review last 7 days of opening/closing checklist submissions', false, false),
  (2,  'Spot-check temperature logs against actual chiller readings', true, true),
  (3,  'FIFO followed in chiller and dry store, no expired stock', true, true),
  (4,  'Staff grooming and hygiene compliance', true, false),
  (5,  'Shawarma & alfaham taste/quality check against SOP', false, false),
  (6,  'Portion sizes match spec (weigh 2 random orders)', true, false),
  (7,  'FOH cleanliness and customer area presentation', true, false),
  (8,  'Review customer complaints and Zomato/Swiggy ratings for the week', false, false),
  (9,  'Wastage log reviewed and signed', false, false),
  (10, 'Staff roster vs actual attendance verified', false, false),
  (11, 'Pest control devices in place, no signs of pest activity', true, true),
  (12, 'Fire extinguisher accessible and in date', true, true),
  (13, 'Training/onboarding progress of new joiners reviewed', false, false)
) as v(p, txt, photo, crit);

-- Operations manager audit
with t as (
  insert into public.checklist_templates (name, description, type)
  values ('Operations Manager Audit', 'Monthly full-outlet audit by the Operations Manager. Scored - report goes to CEO.', 'ops_audit')
  returning id
)
insert into public.checklist_items (template_id, position, text, requires_photo, critical)
select id, p, txt, photo, crit from t, (values
  (1,  'FSSAI licence, insurance and statutory documents displayed and valid', true, true),
  (2,  'Food safety: temperature logs complete for the month', false, true),
  (3,  'Food safety: raw/cooked segregation and storage practices', true, true),
  (4,  'Kitchen deep-clean standard (hoods, filters, behind equipment)', true, false),
  (5,  'Product quality: blind taste test of 3 core items (shawarma, alfaham, burger)', false, false),
  (6,  'Brand standards: uniforms, packaging, menu boards per brand guide', true, false),
  (7,  'P&L review: food cost %, wastage %, labour cost vs target', false, false),
  (8,  'Inventory variance check on top 10 items', false, true),
  (9,  'Cash handling and POS discount/void report review', false, true),
  (10, 'Customer feedback trend and complaint resolution time', false, false),
  (11, 'Area manager weekly visits completed and actioned', false, false),
  (12, 'Open audit findings/fines from previous month closed', false, false),
  (13, 'Team morale check: interviews with 2 staff members', false, false),
  (14, 'Safety: gas lines, electricals, first-aid kit stocked', true, true)
) as v(p, txt, photo, crit);

-- ---------- SOPs ----------
with s as (
  insert into public.sops (title, category, department, summary)
  values ('Chicken Shawarma Preparation', 'Food Preparation', 'BOH',
          'Marination, spit loading, cooking and serving standard for Bektash chicken shawarma.')
  returning id
)
insert into public.sop_steps (sop_id, position, title, instruction)
select id, p, ti, ins from s, (values
  (1, 'Marination', 'Use the Bektash shawarma marinade premix. Marinate cleaned boneless chicken thighs for a minimum of 8 hours (max 24h) in the chiller at 1-4°C. Label with date and time.'),
  (2, 'Spit loading', 'Layer marinated chicken evenly on the spit, alternating with fat layers. Press each layer to remove air gaps. Cap with a tomato/onion at the top. Target load weight per your outlet''s forecast.'),
  (3, 'Cooking', 'Cook outer layer until golden brown at high heat, then reduce to medium. Never carve undercooked meat - juices must run clear. Internal temperature of carved meat: 75°C or above.'),
  (4, 'Carving', 'Carve thin, even slices top to bottom into the tray. Keep the carving knife sanitized. Do not let carved meat sit for more than 30 minutes in the tray.'),
  (5, 'Assembly', 'Warm kuboos on the flat top. Standard fill: garlic mayo, carved chicken (as per portion spec), pickles, fries if a Bektash special. Roll tight, wrap and label.'),
  (6, 'End of day', 'Remove all remaining meat from spit. Fully cooked meat may be stored max 1 day, labelled, and used only for approved dishes. Discard any undercooked portions - never re-load a used spit next day.')
) as v(p, ti, ins);

with s as (
  insert into public.sops (title, category, department, summary)
  values ('Al Faham Marination & Grilling', 'Food Preparation', 'BOH',
          'Standard for Bektash special al faham - marination, charcoal grilling and serving.')
  returning id
)
insert into public.sop_steps (sop_id, position, title, instruction)
select id, p, ti, ins from s, (values
  (1, 'Chicken prep', 'Use 700-800g whole chicken cut to spec (quarter/half/full). Make even slits for marinade penetration. Pat dry before marinating.'),
  (2, 'Marination', 'Apply Bektash al faham masala evenly including under skin and inside slits. Marinate minimum 4 hours in chiller, labelled with date/time.'),
  (3, 'Charcoal setup', 'Light charcoal 30 min before service. Grill only over grey, ashed-over coals - never open flame. Maintain grill grate cleanliness between batches.'),
  (4, 'Grilling', 'Grill skin side down first. Turn every 5-7 minutes. Baste with marinade-oil mix. Cook to internal temperature 75°C at the thickest part - check with probe thermometer.'),
  (5, 'Serving', 'Rest 3 minutes. Serve with kuboos, garlic mayo, salad and pickle per portion spec. For delivery, vent the box lid to keep skin from steaming soft.')
) as v(p, ti, ins);

with s as (
  insert into public.sops (title, category, department, summary)
  values ('Burger Assembly Standard', 'Food Preparation', 'BOH',
          'Build order, portioning and presentation for Bektash burgers.')
  returning id
)
insert into public.sop_steps (sop_id, position, title, instruction)
select id, p, ti, ins from s, (values
  (1, 'Bun prep', 'Toast bun faces on the flat top until golden - never serve cold buns. Check bun date labels each shift.'),
  (2, 'Patty cooking', 'Cook patties from chilled (never room temp). Flip once. Beef/chicken internal temp 75°C. Cheese slice on patty 30 seconds before removing.'),
  (3, 'Build order', 'Bottom bun -> signature sauce -> lettuce -> tomato -> patty with cheese -> onions/pickles -> top sauce -> crown. Follow spec card quantities exactly.'),
  (4, 'Presentation', 'Wrap in branded paper, cut only if dine-in and requested. Serve within 5 minutes of build. Fries portioned by scoop, salted immediately after frying.')
) as v(p, ti, ins);

with s as (
  insert into public.sops (title, category, department, summary)
  values ('Shakes & Beverage Station', 'Food Preparation', 'FOH',
          'Fruit prep, blending, hygiene and presentation for shakes and juices.')
  returning id
)
insert into public.sop_steps (sop_id, position, title, instruction)
select id, p, ti, ins from s, (values
  (1, 'Daily prep', 'Wash and cut fruit fresh each shift. Store cut fruit covered, labelled, max 4 hours at the station or move to chiller.'),
  (2, 'Milk & ice cream handling', 'Keep milk below 4°C, never leave cartons out. Check dates every open. Ice cream scoops rinsed in running water between uses.'),
  (3, 'Blending', 'Follow recipe cards for quantities. Blend to smooth - no ice chunks. Taste-test consistency standard once per shift.'),
  (4, 'Cleaning', 'Rinse blender jar between different flavours; full sanitize every 2 hours and at close. Wipe station counters continuously.'),
  (5, 'Presentation', 'Serve in branded cups with dome lid for cream-topped shakes. Wipe drips before handover. Straw and tissue with every serve.')
) as v(p, ti, ins);

with s as (
  insert into public.sops (title, category, department, summary)
  values ('Cleaning & Sanitation Schedule', 'Hygiene', null,
          'What gets cleaned, how often, and with what - the non-negotiable hygiene baseline.')
  returning id
)
insert into public.sop_steps (sop_id, position, title, instruction)
select id, p, ti, ins from s, (values
  (1, 'Continuous (during shift)', 'Wipe prep surfaces between tasks with sanitizer spray. Clean as you go - no dirty tools left in sinks. Handwash every 30 minutes and after any raw meat contact.'),
  (2, 'Every 2 hours', 'Sanitize customer tables and counters, door handles, POS screen. Check and clean washrooms. Empty bins over 3/4 full.'),
  (3, 'Every shift close', 'Full clean of grill, flat top, fryer skim, slicer strip-down, floors mopped with degreaser, bins out.'),
  (4, 'Weekly', 'Deep clean: behind and under all equipment, chiller interior, freezer defrost check, exhaust hood filters degreased, wall tiles scrubbed.'),
  (5, 'Chemicals', 'Use only approved chemicals, diluted per label. Never store chemicals near food. Colour-coded cloths: green = food areas, red = washroom, blue = FOH.')
) as v(p, ti, ins);

with s as (
  insert into public.sops (title, category, department, summary)
  values ('Customer Service & Order Handling', 'Service', 'FOH',
          'Greeting, order taking, complaint handling and delivery-partner handover standards.')
  returning id
)
insert into public.sop_steps (sop_id, position, title, instruction)
select id, p, ti, ins from s, (values
  (1, 'Greeting', 'Acknowledge every customer within 10 seconds of entering, with a smile. Suggest the Bektash special of the day.'),
  (2, 'Order taking', 'Repeat the order back before billing. Confirm spice level and any allergies. Quote realistic wait time - never over-promise.'),
  (3, 'Service time targets', 'Shawarma/burger: 7 minutes. Al faham: 15 minutes (grilled fresh). If delayed, inform the customer before they ask.'),
  (4, 'Complaint handling', 'Listen fully, apologise once sincerely, fix it fast (remake or refund per manager). Log every complaint in the register. Never argue - call the shift manager if tense.'),
  (5, 'Delivery handover', 'Verify order ID with the rider, seal bags with sticker, note handover time. Keep delivery shelf separate from dine-in counter.')
) as v(p, ti, ins);

-- ---------- Training modules ----------
with m as (
  insert into public.training_modules (title, description, department, required_for_onboarding, position)
  values ('Food Safety & Personal Hygiene Basics', 'FSSAI-aligned food safety fundamentals every Bektash team member must know before their first shift.', null, true, 1)
  returning id
)
insert into public.training_lessons (module_id, position, title, content)
select id, p, ti, c from m, (values
  (1, 'Why food safety matters', 'One incident of food poisoning can shut an outlet and destroy customer trust built over years. Every rule in this module exists because it prevents real harm. You are personally responsible for the food you touch.'),
  (2, 'Handwashing', 'Wash hands with soap for 20 seconds: on arrival, after breaks, after touching raw meat, after touching your face/phone, after cleaning, after the washroom. Dry with paper towel only.'),
  (3, 'Personal presentation', 'Clean uniform daily. Hair fully covered with cap/net. Nails short, no polish. No rings, watches or bracelets in food areas. Cuts covered with blue waterproof plaster. Report any illness (vomiting, diarrhoea, fever) to your manager - do NOT work with food while sick.'),
  (4, 'Temperature danger zone', 'Bacteria multiply fastest between 5°C and 60°C. Keep cold food below 4°C, hot food above 63°C. Cooked chicken must reach 75°C at the centre. When in doubt, probe it.'),
  (5, 'Cross-contamination', 'Raw chicken never touches or drips onto anything ready-to-eat. Separate boards, knives and cloths for raw vs cooked. Store raw meat on the lowest chiller shelf.'),
  (6, 'Labelling & FIFO', 'Everything in the chiller carries a label: item, date, time. First In, First Out - use oldest stock first. Expired or unlabelled food goes in the bin, no exceptions.')
) as v(p, ti, c);

with m as (
  insert into public.training_modules (title, description, department, required_for_onboarding, position)
  values ('FOH Service Excellence', 'Front-of-house standards: customer experience, POS discipline and the Bektash way of service.', 'FOH', false, 2)
  returning id
)
insert into public.training_lessons (module_id, position, title, content)
select id, p, ti, c from m, (values
  (1, 'The Bektash welcome', 'We''re a neighbourhood favourite, not a faceless chain. Greet regulars by name where you can. Every customer gets acknowledged within 10 seconds.'),
  (2, 'Menu knowledge', 'You must be able to describe every item: what''s in it, spice level, prep time, and what to recommend for first-timers (Bektash Special Al Faham, Chicken Shawarma).'),
  (3, 'POS & cash discipline', 'Every sale rings through the POS - no exceptions. Discounts only with manager code. Count change back to the customer. Till variances over ₹100 are reported same shift.'),
  (4, 'Handling rush hours', 'Communicate wait times honestly. Keep the counter queue moving: take orders, then step aside for pickup. Call out order numbers clearly.')
) as v(p, ti, c);

with m as (
  insert into public.training_modules (title, description, department, required_for_onboarding, position)
  values ('BOH Kitchen Fundamentals', 'Back-of-house essentials: stations, equipment safety, and quality standards.', 'BOH', false, 3)
  returning id
)
insert into public.training_lessons (module_id, position, title, content)
select id, p, ti, c from m, (values
  (1, 'Know your stations', 'Shawarma spit, charcoal grill (al faham), flat top/burger station, fryer, shake station. You will be signed off on each station separately by your store manager.'),
  (2, 'Equipment safety', 'Grill and fryer burns are the #1 kitchen injury. Use gloves and long tools. Never leave the fryer unattended. Know where the fire blanket, extinguisher and gas shutoff are.'),
  (3, 'Follow the spec, every time', 'Recipes and portion specs are not suggestions. A shawarma in Marad must taste identical to one in Kakkanad. Weigh portions until you can eyeball them accurately - then keep spot-checking yourself.'),
  (4, 'Wastage control', 'Log all wastage honestly with reason. Over-prepping is the biggest cost leak - follow the prep forecast, ask your shift manager before making more.')
) as v(p, ti, c);

with m as (
  insert into public.training_modules (title, description, department, required_for_onboarding, position)
  values ('Compliance & The Audit System', 'How checklists, audits, alerts and fines work at Bektash - and how to never get fined.', null, true, 4)
  returning id
)
insert into public.training_lessons (module_id, position, title, content)
select id, p, ti, c from m, (values
  (1, 'Daily checklists', 'Opening and closing checklists are done every day in this app, with photo evidence. They protect YOU - a completed checklist is proof you did your job right.'),
  (2, 'Who checks what', 'Shift/Store managers run daily checklists. The Area Manager inspects weekly. The Operations Manager audits monthly. The Audit Executive can inspect anything, anytime - including CCTV review.'),
  (3, 'Fines & appeals', 'Serious or repeated violations can result in a fine, filed with evidence and sent to HR. If you believe a fine is wrong, appeal it in the app with your explanation - HR reviews every appeal fairly and cancels fines that don''t hold up.'),
  (4, 'The easy way to never get fined', 'Do the checklist honestly (never fake a photo), follow the SOPs, and report problems early. Nobody gets fined for reporting a broken chiller - people get fined for hiding one.')
) as v(p, ti, c);

-- ---------- Onboarding tasks ----------
insert into public.onboarding_tasks (department, position, title, description, requires_verification) values
  (null, 1,  'Submit documents to HR', 'ID proof, address proof, bank details, and photos for records.', true),
  (null, 2,  'Medical fitness certificate', 'Food handler medical certificate as required under FSSAI Schedule 4.', true),
  (null, 3,  'Receive uniform & name badge', 'Two sets of uniform, cap/hair net, and name badge issued.', true),
  (null, 4,  'Outlet tour & introductions', 'Meet the team; locate fire exits, extinguisher, first-aid kit, gas shutoff.', true),
  (null, 5,  'Complete "Food Safety & Personal Hygiene Basics" training', 'Finish the required training module in the Training section of this app.', false),
  (null, 6,  'Complete "Compliance & The Audit System" training', 'Understand checklists, audits and the fines/appeals process.', false),
  (null, 7,  'App access confirmed', 'Logged in to the Bektash Ops app, correct outlet and department showing on profile.', false),
  ('FOH', 8, 'POS system walkthrough', 'Billing, KOT, discounts (manager-only) and end-of-day report, guided by shift manager.', true),
  ('FOH', 9, 'Menu tasting & knowledge check', 'Taste core items; shift manager quizzes you on menu descriptions and prices.', true),
  ('FOH', 10, 'Shadow a senior on service', 'One full shift shadowing counter service, order handover and delivery-partner handling.', true),
  ('BOH', 8, 'Station induction: shawarma & grill', 'Safety induction on the shawarma machine and charcoal grill with the store manager.', true),
  ('BOH', 9, 'Knife & slicer safety sign-off', 'Correct handling, cleaning and storage of knives and the shawarma slicer.', true),
  ('BOH', 10, 'Shadow a senior on prep', 'One full shift shadowing marination, prep labelling and FIFO practice.', true);
