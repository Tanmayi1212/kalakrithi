/**
 * Test Backend Connection Component
 * 
 * Simple component to test Cloud Functions connectivity
 */

'use client';

import { useState } from 'react';
import { useTestConnection } from '@/src/hooks/useFirebase';

export default function TestConnection() {
    const { testConnection, loading, result, error } = useTestConnection();
    const [testResult, setTestResult] = useState(null);

    const handleTest = async () => {
        try {
            const response = await testConnection();
            setTestResult(response);
        } catch (err) {
            setTestResult({ error: err.message });
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Test Backend Connection</h1>

            <button
                onClick={handleTest}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
                {loading ? 'Testing...' : 'Test Connection'}
            </button>

            {testResult && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                    <h2 className="font-bold mb-2">Response:</h2>
                    <pre className="text-sm overflow-auto">
                        {JSON.stringify(testResult, null, 2)}
                    </pre>
                </div>
            )}

            {error && (
                <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-lg">
                    <p>❌ Error: {error}</p>
                </div>
            )}
        </div>
    );
}
