import { useEffect, useState } from "react";
import { useAuthentication } from "../context/AuthContext";
import { sendApiRequest } from "../lib/apiClient";

export function AdminPage() {
  const { supabaseSession } = useAuthentication();
  const [categoryNameInput, setCategoryNameInput] = useState("");
  const [wordFormState, setWordFormState] = useState({ category_id: "", word: "", hint: "" });
  const [categoryRows, setCategoryRows] = useState([]);
  const [wordRows, setWordRows] = useState([]);
  const [scoreRows, setScoreRows] = useState([]);

  async function loadAdminData() {
    const accessToken = supabaseSession?.access_token;
    if (!accessToken) return;
    const [categories, words, scoreboard] = await Promise.all([
      sendApiRequest("/api/v1/admin/categories", { accessToken }),
      sendApiRequest("/api/v1/admin/words", { accessToken }),
      sendApiRequest("/api/v1/admin/scoreboard", { accessToken }),
    ]);
    setCategoryRows(categories);
    setWordRows(words);
    setScoreRows(scoreboard);
    if (categories.length > 0) {
      setWordFormState((previousWordFormState) => ({
        ...previousWordFormState,
        category_id: String(categories[0].id),
      }));
    }
  }

  useEffect(() => {
    loadAdminData().catch(() => null);
  }, [supabaseSession]);

  async function createCategory(event) {
    event.preventDefault();
    await sendApiRequest("/api/v1/admin/categories", {
      method: "POST",
      accessToken: supabaseSession.access_token,
      body: { name: categoryNameInput },
    });
    setCategoryNameInput("");
    await loadAdminData();
  }

  async function createWord(event) {
    event.preventDefault();
    await sendApiRequest("/api/v1/admin/words", {
      method: "POST",
      accessToken: supabaseSession.access_token,
      body: {
        category_id: Number(wordFormState.category_id),
        word: wordFormState.word,
        hint: wordFormState.hint,
      },
    });
    setWordFormState((previousWordFormState) => ({ ...previousWordFormState, word: "", hint: "" }));
    await loadAdminData();
  }

  async function resetPlayerScore(profileId) {
    await sendApiRequest(`/api/v1/admin/scoreboard/reset?profile_id=${profileId}`, {
      method: "POST",
      accessToken: supabaseSession.access_token,
    });
    await loadAdminData();
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-xl bg-white p-4 shadow">
        <h3 className="mb-3 text-xl font-bold">Categories</h3>
        <form className="mb-3 flex gap-2" onSubmit={createCategory}>
          <input
            className="flex-1 rounded border border-slate-300 p-2"
            placeholder="New category name"
            value={categoryNameInput}
            onChange={(event) => setCategoryNameInput(event.target.value)}
            required
          />
          <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">
            Add
          </button>
        </form>
        <ul className="space-y-1 text-sm">
          {categoryRows.map((categoryRow) => (
            <li key={categoryRow.id}>
              {categoryRow.id}. {categoryRow.name}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-white p-4 shadow">
        <h3 className="mb-3 text-xl font-bold">Words</h3>
        <form className="space-y-2" onSubmit={createWord}>
          <select
            className="w-full rounded border border-slate-300 p-2"
            value={wordFormState.category_id}
            onChange={(event) =>
              setWordFormState((previousWordFormState) => ({
                ...previousWordFormState,
                category_id: event.target.value,
              }))
            }
          >
            {categoryRows.map((categoryRow) => (
              <option key={categoryRow.id} value={categoryRow.id}>
                {categoryRow.name}
              </option>
            ))}
          </select>
          <input
            className="w-full rounded border border-slate-300 p-2"
            placeholder="Word"
            value={wordFormState.word}
            onChange={(event) =>
              setWordFormState((previousWordFormState) => ({ ...previousWordFormState, word: event.target.value }))
            }
            required
          />
          <input
            className="w-full rounded border border-slate-300 p-2"
            placeholder="Hint"
            value={wordFormState.hint}
            onChange={(event) =>
              setWordFormState((previousWordFormState) => ({ ...previousWordFormState, hint: event.target.value }))
            }
            required
          />
          <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">
            Add Word
          </button>
        </form>
        <ul className="mt-3 max-h-52 space-y-1 overflow-auto text-sm">
          {wordRows.map((wordRow) => (
            <li key={wordRow.id}>
              {wordRow.word} - {wordRow.hint}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-white p-4 shadow md:col-span-2">
        <h3 className="mb-3 text-xl font-bold">Scoreboard Reset</h3>
        <div className="space-y-2">
          {scoreRows.map((scoreRow) => (
            <div key={scoreRow.profile_id} className="flex items-center justify-between rounded border border-slate-200 p-2">
              <p>
                {scoreRow.username || scoreRow.profile_id} - {scoreRow.wins} wins
              </p>
              <button
                type="button"
                className="rounded bg-rose-600 px-3 py-1 text-white"
                onClick={() => resetPlayerScore(scoreRow.profile_id)}
              >
                Reset
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
