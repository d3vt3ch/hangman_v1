import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabaseClient } from "../lib/supabaseClient";
import { sendApiRequest } from "../lib/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [supabaseSession, setSupabaseSession] = useState(null);
  const [authenticatedProfile, setAuthenticatedProfile] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [latestAuthErrorMessage, setLatestAuthErrorMessage] = useState("");

  useEffect(() => {
    async function initializeAuthenticationState() {
      const { data } = await supabaseClient.auth.getSession();
      setSupabaseSession(data.session ?? null);
    }
    initializeAuthenticationState();

    const { data: authStateSubscription } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSupabaseSession(session ?? null);
    });

    return () => {
      authStateSubscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function loadAuthenticatedProfileFromBackend() {
      if (!supabaseSession?.access_token) {
        setAuthenticatedProfile(null);
        setIsAuthLoading(false);
        return;
      }

      try {
        const responseData = await sendApiRequest("/api/v1/auth/me", {
          accessToken: supabaseSession.access_token,
        });
        setAuthenticatedProfile(responseData.profile);
        setLatestAuthErrorMessage("");
      } catch (error) {
        setAuthenticatedProfile(null);
        setLatestAuthErrorMessage(
          error?.message || "Authentication succeeded, but profile loading failed.",
        );
      } finally {
        setIsAuthLoading(false);
      }
    }

    loadAuthenticatedProfileFromBackend();
  }, [supabaseSession]);

  const authContextValue = useMemo(
    () => ({
      supabaseSession,
      authenticatedProfile,
      isAuthLoading,
      latestAuthErrorMessage,
      async registerPlayerWithEmail(emailAddress, passwordText, usernameText) {
        return supabaseClient.auth.signUp({
          email: emailAddress,
          password: passwordText,
          options: { data: { username: usernameText } },
        });
      },
      async loginWithEmail(emailAddress, passwordText) {
        return supabaseClient.auth.signInWithPassword({
          email: emailAddress,
          password: passwordText,
        });
      },
      async logoutCurrentUser() {
        await supabaseClient.auth.signOut();
      },
    }),
    [supabaseSession, authenticatedProfile, isAuthLoading, latestAuthErrorMessage],
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
}

export function useAuthentication() {
  const authContextValue = useContext(AuthContext);
  if (!authContextValue) {
    throw new Error("useAuthentication must be used inside AuthProvider.");
  }
  return authContextValue;
}
