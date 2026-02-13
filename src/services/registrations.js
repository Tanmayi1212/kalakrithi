/**
 * Client-side Registration Functions
 * Uses Firebase Cloud Functions for workshop and game registrations
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

/**
 * Submit workshop registration
 * @param {Object} registrationData - Workshop registration data
 * @returns {Promise<Object>} { success: boolean, message: string, error?: string }
 */
export async function submitWorkshopRegistration(registrationData) {
    try {
        const registerWorkshop = httpsCallable(functions, 'registerWorkshop');
        const result = await registerWorkshop(registrationData);

        return {
            success: true,
            message: result.data.message,
            data: result.data
        };
    } catch (error) {
        console.error('Workshop registration error:', error);

        // Handle specific Firebase errors
        let errorMessage = 'Registration failed. Please try again.';

        if (error.code === 'functions/already-exists') {
            errorMessage = 'You have already registered for this workshop.';
        } else if (error.code === 'functions/resource-exhausted') {
            errorMessage = 'This workshop is full. No slots available.';
        } else if (error.code === 'functions/invalid-argument') {
            errorMessage = error.message || 'Invalid registration data. Please check your inputs.';
        } else if (error.code === 'functions/not-found') {
            errorMessage = 'Workshop not found.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}

/**
 * Submit game registration
 * @param {Object} registrationData - Game registration data
 * @returns {Promise<Object>} { success: boolean, message: string, error?: string }
 */
export async function submitGameRegistration(registrationData) {
    try {
        const registerGame = httpsCallable(functions, 'registerGame');
        const result = await registerGame(registrationData);

        return {
            success: true,
            message: result.data.message,
            data: result.data
        };
    } catch (error) {
        console.error('Game registration error:', error);

        // Handle specific Firebase errors
        let errorMessage = 'Registration failed. Please try again.';

        if (error.code === 'functions/already-exists') {
            errorMessage = 'You have already registered for this game.';
        } else if (error.code === 'functions/resource-exhausted') {
            errorMessage = 'This game is full. No slots available.';
        } else if (error.code === 'functions/invalid-argument') {
            errorMessage = error.message || 'Invalid registration data. Please check your inputs.';
        } else if (error.code === 'functions/not-found') {
            errorMessage = 'Game not found.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}
