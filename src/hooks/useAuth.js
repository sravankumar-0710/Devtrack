import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../firebase";

/**
 * useAuth — handles Google sign-in/out and tracks current user.
 *
 * Returns:
 *   user       {object|null}  Firebase user object, or null if not signed in
 *   loading    {boolean}      true while checking auth state on first load
 *   signIn()   {fn}           trigger Google sign-in popup
 *   signOut()  {fn}           sign out
 */
export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn  = () => signInWithPopup(auth, provider);
  const logout  = () => signOut(auth);

  return { user, loading, signIn, logout };
}