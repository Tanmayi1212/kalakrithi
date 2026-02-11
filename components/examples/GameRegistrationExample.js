// Example: Arangetra Game Registration Component
// This file demonstrates how to integrate Firebase hooks for game registration

'use client';

import { useState } from 'react';
import { useArangetraGames, registerForGame } from '@/lib/firebaseHooks';

export default function GameRegistration() {
    const { games, loading: gamesLoading } = useArangetraGames();
    const [selectedGame, setSelectedGame] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        rollNumber: '',
        phone: ''
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleGameSelect = (game) => {
        setSelectedGame(game);
        setMessage({ type: '', text: '' });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.name || !formData.rollNumber || !formData.phone) {
            setMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        if (!selectedGame) {
            setMessage({ type: 'error', text: 'Please select a game' });
            return;
        }

        // Validate phone number
        if (!/^[0-9]{10}$/.test(formData.phone)) {
            setMessage({ type: 'error', text: 'Phone number must be 10 digits' });
            return;
        }

        setIsProcessing(true);
        setMessage({ type: '', text: '' });

        try {
            const result = await registerForGame({
                gameId: selectedGame.id,
                name: formData.name,
                rollNumber: formData.rollNumber,
                phone: formData.phone
            });

            if (result.success) {
                setMessage({
                    type: 'success',
                    text: result.data.message || 'Registration successful!'
                });

                // Reset form
                setFormData({ name: '', rollNumber: '', phone: '' });
                setSelectedGame(null);
            } else {
                setMessage({ type: 'error', text: result.error });
            }

        } catch (error) {
            console.error('Registration error:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Registration failed. Please try again.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (gamesLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p>Loading games...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Arangetra Game Registration</h1>
            <p className="text-gray-600 mb-8">Register for FREE games!</p>

            {/* Step 1: Select Game */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Select a Game</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {games.map((game) => (
                        <div
                            key={game.id}
                            onClick={() => handleGameSelect(game)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedGame?.id === game.id
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-300 hover:border-green-300'
                                }`}
                        >
                            <h3 className="font-bold text-lg">{game.name}</h3>
                            <p className="text-gray-600 text-sm mt-2">{game.description}</p>
                            <p className="text-green-600 font-semibold mt-2">FREE</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Step 2: Fill Details */}
            {selectedGame && (
                <form onSubmit={handleRegister} className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Your Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-lg"
                            required
                        />
                        <input
                            type="text"
                            name="rollNumber"
                            placeholder="Roll Number"
                            value={formData.rollNumber}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-lg"
                            required
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number (10 digits)"
                            value={formData.phone}
                            onChange={handleInputChange}
                            maxLength="10"
                            className="p-3 border border-gray-300 rounded-lg md:col-span-2"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isProcessing ? 'Registering...' : 'Register for FREE'}
                    </button>
                </form>
            )}

            {/* Message Display */}
            {message.text && (
                <div
                    className={`mt-4 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                >
                    {message.text}
                </div>
            )}
        </div>
    );
}
