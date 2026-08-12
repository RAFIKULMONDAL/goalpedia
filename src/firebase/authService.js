// ─────────────────────────────────────────────
//  Firebase Auth Service
//  Wraps Firebase Auth methods so the rest of
//  the app never imports Firebase directly.
// ─────────────────────────────────────────────
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

// ── Register ──────────────────────────────────
export async function registerUser(name, email, password) {
  // Create the Firebase Auth account
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  // Set the display name on the Auth profile
  await updateProfile(user, { displayName: name });

  // Create a user document in Firestore (for favourites, etc.)
  await setDoc(doc(db, 'users', user.uid), {
    uid:              user.uid,
    name,
    email,
    favouritePlayers: [],
    favouriteClubs:   [],
    createdAt:        serverTimestamp(),
  });

  return user;
}

// ── Login ─────────────────────────────────────
export async function loginUser(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

// ── Logout ────────────────────────────────────
export async function logoutUser() {
  await signOut(auth);
}

// ── Get Firestore user doc ────────────────────
export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

// ── Auth state listener ───────────────────────
// Used by AuthContext to stay in sync with Firebase
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
