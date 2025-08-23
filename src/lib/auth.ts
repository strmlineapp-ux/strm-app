import { auth as firebaseAuth, db } from "./firebase";
import {
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged as onFirebaseAuthStateChanged,
    signOut,
    User as FirebaseAuthUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { User } from "./types";

const provider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<FirebaseAuthUser> {
    try {
        const result = await signInWithPopup(firebaseAuth, provider);
        const user = result.user;
        
        // Check if user exists in Firestore, if not create a new document
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
            await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                status: 'pending',
                isAdmin: false, // Default new users to not be admins
            });
        }
        return user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
}

export async function signOutUser(): Promise<void> {
    try {
        await signOut(firebaseAuth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
}

export function onAuthStateChanged(callback: (user: FirebaseAuthUser | null) => void) {
    return onFirebaseAuthStateChanged(firebaseAuth, callback);
}

export const authServer = {
    verifyIdToken: (token: string) => firebaseAuth.verifyIdToken(token),
    getUser: (uid: string) => firebaseAuth.getUser(uid),
};

export async function getAuthenticatedUser(): Promise<FirebaseAuthUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = onFirebaseAuthStateChanged(firebaseAuth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
}
