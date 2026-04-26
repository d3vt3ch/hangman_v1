import { useEffect, useState } from "react";
import { useAuthentication } from "../context/AuthContext";
import { sendApiRequest } from "../lib/apiClient";

export function SuperAdminPage() {
  const { supabaseSession, authenticatedProfile } = useAuthentication();
  const [userRows, setUserRows] = useState([]);
  const [actionResultMessage, setActionResultMessage] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  async function loadUserRows() {
    setIsLoadingUsers(true);
    try {
      const responseRows = await sendApiRequest("/api/v1/admin/roles/users", {
        accessToken: supabaseSession.access_token,
      });
      setUserRows(responseRows);
    } catch (error) {
      setActionResultMessage(error.message);
      setUserRows([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }

  useEffect(() => {
    if (!supabaseSession?.access_token) {
      return;
    }
    loadUserRows().catch(() => null);
  }, [supabaseSession]);

  async function updateRole(endpointPath, targetUserId) {
    try {
      const result = await sendApiRequest(endpointPath, {
        method: "POST",
        accessToken: supabaseSession.access_token,
        body: { target_user_id: targetUserId },
      });
      setActionResultMessage(`Updated user ${result.user_id} to role ${result.role}.`);
      await loadUserRows();
    } catch (error) {
      setActionResultMessage(error.message);
    }
  }

  return (
    <section className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-3 text-2xl font-bold">Super Admin Role Management</h2>
      {isLoadingUsers ? (
        <p className="text-sm text-slate-600">Loading users...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2">Username</th>
                <th className="py-2">Role</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userRows.map((userRow) => {
                const isCurrentLoggedInSuperAdmin = authenticatedProfile?.user_id === userRow.user_id;
                return (
                  <tr key={userRow.user_id} className="border-b border-slate-100">
                    <td className="py-2">{userRow.username || userRow.user_id}</td>
                    <td className="py-2">
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs">{userRow.role}</span>
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="rounded bg-slate-900 px-3 py-1 text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                          onClick={() => updateRole("/api/v1/admin/roles/promote-admin", userRow.user_id)}
                          disabled={userRow.role !== "player"}
                        >
                          Promote
                        </button>
                        <button
                          type="button"
                          className="rounded bg-rose-600 px-3 py-1 text-white disabled:cursor-not-allowed disabled:bg-rose-300"
                          onClick={() => updateRole("/api/v1/admin/roles/demote-admin", userRow.user_id)}
                          disabled={userRow.role !== "admin" || isCurrentLoggedInSuperAdmin}
                        >
                          Demote
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {actionResultMessage && <p className="mt-3 text-sm text-slate-700">{actionResultMessage}</p>}
    </section>
  );
}
