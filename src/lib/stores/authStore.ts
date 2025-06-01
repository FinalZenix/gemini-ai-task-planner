import { writable } from 'svelte/store';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithPopup,
    type User
} from 'firebase/auth';
import { auth, googleProvider } from '$lib/firebase';
import { goto } from '$app/navigation';

// User store
export const user = writable<User | null>(null);
export const authLoading = writable(true);
export const authError = writable<string | null>(null);

// Initialize auth state listener
export function initAuth() {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        user.set(currentUser);
        authLoading.set(false);
    });

    return unsubscribe;
}

// Register with email and password
export async function register(email: string, password: string) {
    authError.set(null);
    try {
        authLoading.set(true);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        user.set(userCredential.user);
        goto('/dashboard');
        return userCredential.user;
    } catch (error: any) {
        console.error('Registration error:', error);
        // Handle Firebase auth error codes
        if (error.code === 'auth/email-already-in-use') {
            authError.set('This email is already in use. Please try logging in instead.');
        } else if (error.code === 'auth/invalid-email') {
            authError.set('Invalid email address format.');
        } else if (error.code === 'auth/weak-password') {
            authError.set('Password is too weak. Please use a stronger password.');
        } else if (error.code === 'auth/network-request-failed') {
            authError.set('Network error. Please check your internet connection.');
        } else {
            authError.set(error.message || 'Failed to register. Please try again.');
        }
        return null;
    } finally {
        authLoading.set(false);
    }
}

// Login with email and password
export async function login(email: string, password: string) {
    authError.set(null);
    try {
        authLoading.set(true);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user.set(userCredential.user);
        goto('/dashboard');
        return userCredential.user;
    } catch (error: any) {
        console.error('Login error:', error);
        // Handle Firebase auth error codes
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            authError.set('Invalid email or password. Please try again.');
        } else if (error.code === 'auth/invalid-email') {
            authError.set('Invalid email address format.');
        } else if (error.code === 'auth/user-disabled') {
            authError.set('This account has been disabled. Please contact support.');
        } else if (error.code === 'auth/too-many-requests') {
            authError.set('Too many failed login attempts. Please try again later.');
        } else if (error.code === 'auth/network-request-failed') {
            authError.set('Network error. Please check your internet connection.');
        } else {
            authError.set(error.message || 'Failed to login. Please try again.');
        }
        return null;
    } finally {
        authLoading.set(false);
    }
}

// Sign in with Google
export async function signInWithGoogle() {
    authError.set(null);
    try {
        authLoading.set(true);
        const result = await signInWithPopup(auth, googleProvider);
        user.set(result.user);
        goto('/dashboard');
        return result.user;
    } catch (error: any) {
        console.error('Google sign-in error:', error);
        // Handle Firebase auth error codes
        if (error.code === 'auth/popup-closed-by-user') {
            authError.set('Sign-in popup was closed before completing the sign-in.');
        } else if (error.code === 'auth/popup-blocked') {
            authError.set('Sign-in popup was blocked by the browser. Please allow popups for this site.');
        } else if (error.code === 'auth/cancelled-popup-request') {
            authError.set('Sign-in popup request was cancelled.');
        } else if (error.code === 'auth/network-request-failed') {
            authError.set('Network error. Please check your internet connection.');
        } else {
            authError.set(error.message || 'Failed to sign in with Google. Please try again.');
        }
        return null;
    } finally {
        authLoading.set(false);
    }
}

// Sign out
export async function signOut() {
    try {
        await firebaseSignOut(auth);
        user.set(null);
        goto('/login');
    } catch (error: any) {
        console.error('Sign out error:', error);
        authError.set(error.message);
    }
}
