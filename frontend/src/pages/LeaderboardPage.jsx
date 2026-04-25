import { useEffect, useState } from "react";
import { sendApiRequest } from "../lib/apiClient";

export function LeaderboardPage() {
  const [leaderboardRows, setLeaderboardRows] = useState([]);

  useEffect(() => {
    sendApiRequest("/api/v1/game/leaderboard")
      .then((responseRows) => setLeaderboardRows(responseRows))
      .catch(() => setLeaderboardRows([]));
  }, []);

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold">Leaderboard</h2>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="py-2">Player</th>
            <th className="py-2">Wins</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardRows.map((leaderboardRow) => (
            <tr key={leaderboardRow.profile_id} className="border-b border-slate-100">
              <td className="py-2">{leaderboardRow.username || leaderboardRow.profile_id}</td>
              <td className="py-2">{leaderboardRow.wins}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
