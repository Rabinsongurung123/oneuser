"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { C } from "@/components/ui-lib/theme";
import PageHeader from "@/components/ui-lib/PageHeader";
import Card from "@/components/ui-lib/Card";
import ConfirmDialog from "@/components/ui-lib/ConfirmDialog";
import { useToast } from "@/components/ui-lib/Toast";
import { useAuth } from "@/components/ui-lib/AuthContext";
import { CURRENT_MEMBER } from "@/lib/mock-data";

function Field({ label, value, onChange, hint }) {
  return (
    <div>
      <label className="f-body text-[12.5px] font-medium block mb-1.5" style={{ color: C.slate }}>{label}</label>
      <input
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 rounded-md f-body text-[13px] outline-none"
        style={{ background: C.paper, border: `1px solid ${C.paperLine}`, color: C.slate }}
      />
      {hint && <p className="f-body text-[11.5px] mt-1" style={{ color: C.slateMute }}>{hint}</p>}
    </div>
  );
}

export default function MemberProfile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || CURRENT_MEMBER.name,
    email: user?.email || CURRENT_MEMBER.email,
    branch: CURRENT_MEMBER.branch,
  });
  const [savedSnapshot, setSavedSnapshot] = useState(profile);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const showToast = useToast();

  const dirty = JSON.stringify(profile) !== JSON.stringify(savedSnapshot);

  const setField = (key) => (e) => setProfile((p) => ({ ...p, [key]: e.target.value }));

  const save = () => {
    setSavedSnapshot(profile);
    showToast("Profile saved", "sage");
  };

  const signOut = async () => {
    setConfirmSignOut(false);
    try {
      await logout();
    } finally {
      router.push("/guest/login?signedOut=1");
    }
  };

  return (
    <>
      <PageHeader title="Profile / Settings" subtitle="Your account details." />
      <Card title="Personal Information">
        <div className="space-y-4">
          <Field label="Full name" value={profile.name} onChange={setField("name")} />
          <Field label="Email" value={profile.email} onChange={setField("email")} />
          <Field label="Home branch" value={profile.branch} onChange={setField("branch")} hint="Where you usually pick up holds." />
        </div>
      </Card>
      <div className="flex items-center justify-end gap-3 mt-4">
        {dirty && (
          <span className="f-body text-[12px]" style={{ color: C.brass }}>Unsaved changes</span>
        )}
        <button
          onClick={save}
          className="px-4 py-2 rounded-md f-body text-[13px] font-medium cursor-pointer"
          style={{ background: C.ink, color: C.paper }}
        >
          Save Changes
        </button>
      </div>

      <div className="mt-6">
        <Card title="Session">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="f-body text-[13.5px] font-medium" style={{ color: C.slate }}>
                Sign out of your account
              </p>
              <p className="f-body text-[12.5px] mt-1" style={{ color: C.slateMute }}>
                Ends this session and returns you to the login page. You can log back in anytime.
              </p>
            </div>
            <button
              onClick={() => setConfirmSignOut(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-md f-body text-[13px] font-medium cursor-pointer transition-colors hover:opacity-80 flex-shrink-0"
              style={{ background: C.paper, border: `1px solid ${C.stamp}`, color: C.stamp }}
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        onConfirm={signOut}
        title="Sign out?"
        message="Your session will be ended and you'll be returned to the login page."
        confirmLabel="Sign Out"
        danger
      />
    </>
  );
}
