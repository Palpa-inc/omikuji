import { useEffect, useState } from "react";
import {
  signInAnonymously as signInAnonymouslyWithFirebase,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./config";
import { mergeAnonymousData } from "./db";

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signInAnonymously = async (): Promise<User> => {
    try {
      const credential = await signInAnonymouslyWithFirebase(auth);
      setUser(credential.user);
      return credential.user;
    } catch (error) {
      console.error("Anonymous auth error:", error);
      throw error;
    }
  };

  const linkGoogleAccount = async () => {
    if (!user) return;
    try {
      const result = await linkWithPopup(user, googleProvider);
      if (
        result.user &&
        !result.user.photoURL &&
        result.user.providerData[0]?.photoURL
      ) {
        await updateProfile(result.user, {
          photoURL: result.user.providerData[0].photoURL,
        });
      }
      await mergeAnonymousData(user.uid, result.user.uid);
    } catch (error) {
      console.error("Google auth error:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (
        result.user &&
        !result.user.photoURL &&
        result.user.providerData[0]?.photoURL
      ) {
        await updateProfile(result.user, {
          photoURL: result.user.providerData[0].photoURL,
        });
      }
    } catch (error) {
      console.error("Google auth error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    signInAnonymously,
    linkGoogleAccount,
    signInWithGoogle,
    logout,
  };
}
