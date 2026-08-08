"use client";

import { useState } from "react";
import type { Outlet, Profile } from "@/lib/types";
import PhotoUpload from "@/components/photo-upload";
import { createFine } from "../actions";

type StaffOption = Pick<Profile, "id" | "full_name" | "outlet_id" | "role">;

export default function NewFineForm({
  outlets,
  staff,
}: {
  outlets: Outlet[];
  staff: StaffOption[];
}) {
  const [outletId, setOutletId] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");

  const outletStaff = staff.filter((s) => !outletId || s.outlet_id === outletId);

  return (
    <form action={createFine} className="card max-w-xl space-y-4">
      <div>
        <label className="label">Outlet *</label>
        <select
          name="outlet_id"
          className="input"
          required
          value={outletId}
          onChange={(e) => setOutletId(e.target.value)}
        >
          <option value="" disabled>
            Select outlet…
          </option>
          {outlets.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Staff member (optional — leave blank for outlet-level fine)</label>
        <select name="staff_id" className="input" defaultValue="">
          <option value="">Outlet-level violation</option>
          {outletStaff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">Violation title *</label>
        <input
          name="title"
          className="input"
          required
          placeholder="e.g. Expired marinade found in chiller"
        />
      </div>

      <div>
        <label className="label">Details</label>
        <textarea
          name="description"
          className="input"
          rows={3}
          placeholder="What was found, when, and which SOP/checklist item it violates…"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Fine amount (₹) *</label>
          <input name="fine_amount" type="number" min="0" step="1" className="input" required />
        </div>
        <div>
          <label className="label">CCTV reference</label>
          <input
            name="cctv_ref"
            className="input"
            placeholder="e.g. Cam 3, 21:40–21:55, 06 Aug"
          />
        </div>
      </div>

      <div>
        <label className="label">Photo evidence</label>
        <PhotoUpload
          folder="violations"
          onUploaded={setEvidenceUrl}
          label="Add evidence photo"
        />
        <input type="hidden" name="evidence_url" value={evidenceUrl} />
      </div>

      <button className="btn-primary w-full">File violation → forward to HR</button>
    </form>
  );
}
