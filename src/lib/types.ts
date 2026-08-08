export type Role =
  | "admin"
  | "ceo"
  | "operations_manager"
  | "area_manager"
  | "audit_executive"
  | "hr"
  | "store_manager"
  | "shift_manager"
  | "staff";

export type Department = "FOH" | "BOH" | "outlet_ops" | "management";

export type TemplateType = "opening" | "closing" | "weekly_area" | "ops_audit" | "custom";

export type ViolationStatus = "issued" | "appealed" | "upheld" | "cancelled" | "paid";

export interface Outlet {
  id: string;
  name: string;
  code: string;
  address: string | null;
  active: boolean;
}

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  department: Department | null;
  outlet_id: string | null;
  phone: string | null;
  active: boolean;
  outlets?: { name: string; code: string } | null;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string | null;
  type: TemplateType;
  department: Department | null;
  active: boolean;
}

export interface ChecklistItem {
  id: string;
  template_id: string;
  position: number;
  text: string;
  requires_photo: boolean;
  critical: boolean;
}

export interface ChecklistRun {
  id: string;
  template_id: string;
  outlet_id: string;
  run_date: string;
  status: "in_progress" | "submitted" | "reviewed";
  started_by: string;
  submitted_at: string | null;
  score: number | null;
}

export interface ChecklistResponse {
  id: string;
  run_id: string;
  item_id: string;
  status: "done" | "issue" | "na";
  note: string | null;
  photo_url: string | null;
}

export interface Violation {
  id: string;
  outlet_id: string;
  staff_id: string | null;
  reported_by: string;
  title: string;
  description: string | null;
  cctv_ref: string | null;
  evidence_url: string | null;
  fine_amount: number;
  status: ViolationStatus;
  appeal_note: string | null;
  appealed_at: string | null;
  hr_note: string | null;
  decided_at: string | null;
  created_at: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  ceo: "CEO",
  operations_manager: "Operations Manager",
  area_manager: "Area Manager",
  audit_executive: "Audit Executive",
  hr: "HR",
  store_manager: "Store Manager",
  shift_manager: "Shift Manager",
  staff: "Staff",
};

export const DEPT_LABELS: Record<Department, string> = {
  FOH: "Front of House",
  BOH: "Back of House",
  outlet_ops: "Outlet Operations",
  management: "Management",
};

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  opening: "Opening",
  closing: "Closing",
  weekly_area: "Area Manager Weekly",
  ops_audit: "Ops Manager Audit",
  custom: "Custom",
};

/** Roles that see cross-outlet data and reports */
export const UPPER_ROLES: Role[] = [
  "admin",
  "ceo",
  "operations_manager",
  "area_manager",
  "audit_executive",
  "hr",
];

/** Roles that manage a single outlet */
export const OUTLET_MANAGER_ROLES: Role[] = ["store_manager", "shift_manager"];

/** Roles with access to the admin panel */
export const ADMIN_ROLES: Role[] = ["admin", "ceo", "operations_manager"];

/** Roles that can issue fines */
export const FINE_ISSUER_ROLES: Role[] = ["audit_executive", "admin", "ceo", "operations_manager"];

/** Roles that decide appeals / manage the fine lifecycle */
export const FINE_DECIDER_ROLES: Role[] = ["hr", "admin", "ceo"];

export function isUpper(role: Role) {
  return UPPER_ROLES.includes(role);
}
export function isOutletManager(role: Role) {
  return OUTLET_MANAGER_ROLES.includes(role);
}
export function isAdminLevel(role: Role) {
  return ADMIN_ROLES.includes(role);
}
