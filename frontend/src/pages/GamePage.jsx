import { useEffect, useMemo, useState } from "react";
import { useAuthentication } from "../context/AuthContext";
import { sendApiRequest } from "../lib/apiClient";

const hangmanStages = ["🧍", "😟", "😬", "😵", "💀"];

export function GamePage() {
  const { supabaseSession } = useAuthentication();
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [randomWordPayload, setRandomWordPayload] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [remainingWrongGuesses, setRemainingWrongGuesses] = useState(4);
  const [inputLetter, setInputLetter] = useState("");
  const [gameDataLoadingMessage, setGameDataLoadingMessage] = useState("");

  useEffect(() => {
    async function loadCategoriesForGame() {
      setGameDataLoadingMessage("Loading categories...");
      const categories = await sendApiRequest("/api/v1/game/categories");
      setCategoryList(categories);
      if (categories.length > 0) {
        setSelectedCategoryId(String(categories[0].id));
        setGameDataLoadingMessage("");
      } else {
        setGameDataLoadingMessage("No categories found yet. Please refresh in a few seconds.");
      }
    }
    loadCategoriesForGame().catch(() => {
      setCategoryList([]);
      setGameDataLoadingMessage("Could not load categories. Please check backend logs and refresh.");
    });
  }, [supabaseSession]);

  const displayedWord = useMemo(() => {
    if (!randomWordPayload) return "";
    return randomWordPayload.word
      .split("")
      .map((currentLetter) => (guessedLetters.includes(currentLetter) ? currentLetter : "_"))
      .join(" ");
  }, [randomWordPayload, guessedLetters]);

  const hasPlayerWon = randomWordPayload
    ? randomWordPayload.word.split("").every((currentLetter) => guessedLetters.includes(currentLetter))
    : false;
  const hasPlayerLost = remainingWrongGuesses <= 0;

  async function startNewGameRound() {
    if (!selectedCategoryId) {
      return;
    }
    const randomWordResponse = await sendApiRequest(`/api/v1/game/random-word?category_id=${selectedCategoryId}`);
    setRandomWordPayload(randomWordResponse);
    setGuessedLetters([]);
    setRemainingWrongGuesses(4);
    setInputLetter("");
  }

  async function submitLetterGuess(event) {
    event.preventDefault();
    const normalizedLetter = inputLetter.toLowerCase().trim();
    if (!normalizedLetter || guessedLetters.includes(normalizedLetter) || !randomWordPayload) return;

    const nextGuessedLetters = [...guessedLetters, normalizedLetter];
    setGuessedLetters(nextGuessedLetters);

    const isWrongGuess = !randomWordPayload.word.includes(normalizedLetter);
    if (isWrongGuess) {
      setRemainingWrongGuesses((previousRemainingWrongGuesses) => previousRemainingWrongGuesses - 1);
    }
    setInputLetter("");
  }

  useEffect(() => {
    if (!hasPlayerWon || !supabaseSession?.access_token) return;
    sendApiRequest("/api/v1/game/record-win", {
      method: "POST",
      accessToken: supabaseSession.access_token,
    }).catch(() => null);
  }, [hasPlayerWon, supabaseSession]);

  return (
    <div className="space-y-4 rounded-xl bg-white p-6 shadow">
      <h2 className="text-2xl font-bold">Play Hangman</h2>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select
            className="rounded border border-slate-300 p-2"
            value={selectedCategoryId}
            onChange={(event) => setSelectedCategoryId(event.target.value)}
            disabled={categoryList.length === 0}
          >
            {categoryList.map((categoryRow) => (
              <option key={categoryRow.id} value={categoryRow.id}>
                {categoryRow.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          onClick={startNewGameRound}
          disabled={categoryList.length === 0}
        >
          Start Round
        </button>
      </div>
      {gameDataLoadingMessage && <p className="text-sm text-amber-700">{gameDataLoadingMessage}</p>}

      {randomWordPayload && (
        <>
          <p className="text-slate-600">Hint: {randomWordPayload.hint}</p>
          <p className="text-3xl font-semibold tracking-widest">{displayedWord}</p>
          <p className="text-4xl">{hangmanStages[4 - remainingWrongGuesses]}</p>
          <p className="text-sm text-slate-600">Guessed letters: {guessedLetters.join(", ") || "-"}</p>
          {!hasPlayerWon && !hasPlayerLost && (
            <form className="flex gap-2" onSubmit={submitLetterGuess}>
              <input
                className="w-16 rounded border border-slate-300 p-2 text-center"
                maxLength={1}
                value={inputLetter}
                onChange={(event) => setInputLetter(event.target.value)}
              />
              <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white">
                Guess
              </button>
            </form>
          )}
          {hasPlayerWon && <p className="font-semibold text-green-700">You won this round.</p>}
          {hasPlayerLost && (
            <p className="font-semibold text-red-700">You lost. Word: {randomWordPayload.word}</p>
          )}
        </>
      )}
    </div>
  );
}
