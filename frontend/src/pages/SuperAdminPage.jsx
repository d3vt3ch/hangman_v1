import { useState } from "react";
import { useAuthentication } from "../context/AuthContext";
import { sendApiRequest } from "../lib/apiClient";

export function SuperAdminPage() {
  const { supabaseSession } = useAuthentication();
  const [targetUserId, setTargetUserId] = useState("");
  const [actionResultMessage, setActionResultMessage] = useState("");

  async function updateRole(endpointPath) {
    try {
      const result = await sendApiRequest(endpointPath, {
        method: "POST",
        accessToken: supabaseSession.access_token,
        body: { target_user_id: targetUserId },
      });
      setActionResultMessage(`Updated user ${result.user_id} to role ${result.role}.`);
      setTargetUserId("");
    } catch (error) {
      setActionResultMessage(error.message);
    }
  }

  return (
    <section className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-3 text-2xl font-bold">Super Admin Role Management</h2>
      <input
        className="mb-3 w-full rounded border border-slate-300 p-2"
        placeholder="Target user UUID"
        value={targetUserId}
        onChange={(event) => setTargetUserId(event.target.value)}
      />
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded bg-slate-900 px-3 py-2 text-white"
          onClick={() => updateRole("/api/v1/admin/roles/promote-admin")}
        >
          Promote to Admin
        </button>
        <button
          type="button"
          className="rounded bg-rose-600 px-3 py-2 text-white"
          onClick={() => updateRole("/api/v1/admin/roles/demote-admin")}
        >
          Demote to Player
        </button>
      </div>
      {actionResultMessage && <p className="mt-3 text-sm text-slate-700">{actionResultMessage}</p>}
    </section>
  );
}
