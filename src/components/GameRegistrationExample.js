/**
 * Example: Game Registration Component
 * 
 * Demonstrates Arangetra game registration flow
 */

'use client';

import { useState } from 'react';
import { useArangetraGames, registerForGame } from '@/src/hooks/useFirebase';

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
                    text: `✅ ${result.data.message}\nRegistration ID: ${result.data.registrationId}`
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
                <div className="text-lg">Loading games...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Arangetra Game Registration</h1>
            <p className="text-gray-600 mb-8 text-lg">Register for FREE games!</p>

            {/* Game Selection */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Select a Game</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {games.map((game) => (
                        <div
                            key={game.id}
                            onClick={() => handleGameSelect(game)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedGame?.id === game.id
                                    ? 'border-green-500 bg-green-50 shadow-md'
                                    : 'border-gray-300 hover:border-green-300 hover:shadow'
                                }`}
                        >
                            <h3 className="font-bold text-lg">{game.name}</h3>
                            <p className="text-gray-600 text-sm mt-2">{game.description}</p>
                            <p className="text-green-600 font-semibold mt-2">FREE</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Registration Form */}
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
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                            required
                        />
                        <input
                            type="text"
                            name="rollNumber"
                            placeholder="Roll Number"
                            value={formData.rollNumber}
                            onChange={handleInputChange}
                            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                            required
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number (10 digits)"
                            value={formData.phone}
                            onChange={handleInputChange}
                            maxLength="10"
                            className="p-3 border border-gray-300 rounded-lg md:col-span-2 focus:outline-none focus:border-green-500"
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
                    className={`mt-4 p-4 rounded-lg whitespace-pre-line ${message.type === 'success'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                >
                    {message.text}
                </div>
            )}
        </div>
    );
}
