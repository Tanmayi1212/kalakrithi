/**
 * Admin Authentication Utilities
 * 
 * Handles admin login, role verification, and session management
 */

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

/**
 * Check if user has admin role in Firestore
 * @param {string} uid - User ID
 * @returns {Promise<boolean>} - True if user is admin
 */
export async function checkAdminRole(uid) {
    try {
        const adminRef = doc(db, 'admins', uid);
        const adminDoc = await getDoc(adminRef);

        if (!adminDoc.exists()) {
            return false;
        }

        const adminData = adminDoc.data();
        return adminData.role === 'admin';
    } catch (error) {
        console.error('Error checking admin role:', error);
        return false;
    }
}

/**
 * Sign in as admin with email and password
 * Verifies admin role after authentication
 * @param {string} email - Admin email
 * @param {string} password - Admin password
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function signInAdmin(email, password) {
    try {
        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Verify admin role
        const isAdmin = await checkAdminRole(user.uid);

        if (!isAdmin) {
            // Sign out if not admin
            await signOut(auth);
            return {
                success: false,
                error: 'You do not have admin privileges. Access denied.'
            };
        }

        return {
            success: true,
            user: {
                uid: user.uid,
                email: user.email
            }
        };
    } catch (error) {
        console.error('Admin sign in error:', error);

        let errorMessage = 'Failed to sign in. Please try again.';

        if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password.';
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your connection.';
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * Sign out admin user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function signOutAdmin() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return {
            success: false,
            error: 'Failed to sign out. Please try again.'
        };
    }
}

/**
 * Get current admin user and verify role
 * @returns {Promise<{isAdmin: boolean, user?: object}>}
 */
export async function getCurrentAdmin() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();

            if (!user) {
                resolve({ isAdmin: false });
                return;
            }

            const isAdmin = await checkAdminRole(user.uid);

            if (isAdmin) {
                resolve({
                    isAdmin: true,
                    user: {
                        uid: user.uid,
                        email: user.email
                    }
                });
            } else {
                resolve({ isAdmin: false });
            }
        });
    });
}

/**
 * Client-side route guard for admin pages
 * Use this in admin page components to protect routes
 * @returns {Promise<{authorized: boolean, loading: boolean, user?: object}>}
 */
export async function requireAdmin() {
    const { isAdmin, user } = await getCurrentAdmin();

    return {
        authorized: isAdmin,
        loading: false,
        user
    };
}
