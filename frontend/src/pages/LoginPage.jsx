import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthentication } from "../context/AuthContext";

export function LoginPage() {
  const { supabaseSession, loginWithEmail, registerPlayerWithEmail } = useAuthentication();
  const [emailAddress, setEmailAddress] = useState("");
  const [passwordText, setPasswordText] = useState("");
  const [usernameText, setUsernameText] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (supabaseSession) {
    return <Navigate to="/" replace />;
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    try {
      if (isRegisterMode) {
        const { error } = await registerPlayerWithEmail(emailAddress, passwordText, usernameText);
        if (error) throw error;
      } else {
        const { error } = await loginWithEmail(emailAddress, passwordText);
        if (error) throw error;
      }
    } catch (error) {
      setErrorMessage(error.message || "Authentication failed.");
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold">{isRegisterMode ? "Create Player Account" : "Login"}</h2>
      <form className="space-y-3" onSubmit={handleAuthSubmit}>
        {isRegisterMode && (
          <input
            className="w-full rounded border border-slate-300 p-2"
            placeholder="Username"
            value={usernameText}
            onChange={(event) => setUsernameText(event.target.value)}
            required
          />
        )}
        <input
          className="w-full rounded border border-slate-300 p-2"
          type="email"
          placeholder="Email"
          value={emailAddress}
          onChange={(event) => setEmailAddress(event.target.value)}
          required
        />
        <input
          className="w-full rounded border border-slate-300 p-2"
          type="password"
          placeholder="Password"
          value={passwordText}
          onChange={(event) => setPasswordText(event.target.value)}
          required
        />
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        <button type="submit" className="w-full rounded bg-slate-900 p-2 font-medium text-white">
          {isRegisterMode ? "Register" : "Login"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => setIsRegisterMode((isCurrentModeRegister) => !isCurrentModeRegister)}
        className="mt-3 text-sm text-slate-700 underline"
      >
        {isRegisterMode ? "Already have an account? Login." : "Need an account? Register."}
      </button>
    </div>
  );
}
