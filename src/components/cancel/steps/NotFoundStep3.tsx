'use client';

import { useState, useEffect } from 'react';

interface NotFoundStep3Props {
    onContinue: (reason: string, feedback: string) => void;
    saving: boolean;
}

export default function NotFoundStep3({ onContinue, saving }: NotFoundStep3Props) {
    const [selectedReason, setSelectedReason] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [subscriptionPrice, setSubscriptionPrice] = useState<number>(25);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscriptionPrice = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/subscription/price');
                if (response.ok) {
                    const data = await response.json();
                    setSubscriptionPrice(data.priceCents / 100);
                } else {
                    setSubscriptionPrice(25); // Fallback
                }
            } catch (error) {
                console.error('Error fetching subscription price:', error);
                setSubscriptionPrice(25); // Fallback
            } finally {
                setLoading(false);
            }
        };
        fetchSubscriptionPrice();
    }, []);

    const discountedPrice = subscriptionPrice - 10; // $10 off

    const reasons = [
        {
            value: 'Too expensive',
            prompt: 'What would be the maximum you would be willing to pay?*'
        },
        {
            value: 'Platform not helpful',
            prompt: 'What can we change to make the platform more helpful?*'
        },
        {
            value: 'Not enough relevant jobs',
            prompt: 'In which way can we make the jobs more relevant?*'
        },
        {
            value: 'Decided not to move',
            prompt: 'What changed for you to decide to not move?*'
        },
        {
            value: 'Other',
            prompt: 'What would have helped you the most?*'
        }
    ];

    const handleContinue = () => {
        console.log('handleContinue called with:', { selectedReason, feedback, canContinue });
        
        if (selectedReason === 'Too expensive') {
            // For "Too expensive", format feedback as "Too Expensive for User, User can Pay {Amount} maximum"
            if (selectedReason && feedback.trim()) {
                const formattedFeedback = `Too Expensive for User, User can Pay $${feedback.trim()} maximum`;
                console.log('Calling onContinue with Too expensive:', { selectedReason, formattedFeedback });
                onContinue(selectedReason, formattedFeedback);
            }
        } else {
            // For other options, need 25+ characters
            if (selectedReason && feedback.trim().length >= 25) {
                console.log('Calling onContinue with other reason:', { selectedReason, feedback: feedback.trim() });
                onContinue(selectedReason, feedback.trim());
            }
        }
    };

    // Check if button should be active
    const canContinue = selectedReason && (
        selectedReason === 'Too expensive' 
            ? feedback.trim() !== '' 
            : feedback.trim().length >= 25
    );

    console.log('NotFoundStep3 render state:', { 
        selectedReason, 
        feedback, 
        feedbackLength: feedback.length,
        canContinue, 
        saving 
    });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 font-dm-sans">
                    What's the main reason?
                </h2>
                <p className="text-gray-800 text-base md:text-lg font-dm-sans">
                    Please take a minute to let us know why:
                </p>
            </div>

            <div className="space-y-4">
                {reasons.map((reason, index) => (
                    <div key={index} className="space-y-3">
                        <label className="flex items-start space-x-3 cursor-pointer">
                            <input
                                type="radio"
                                name="reason"
                                value={reason.value}
                                checked={selectedReason === reason.value}
                                onChange={(e) => setSelectedReason(e.target.value)}
                                className="mt-1 w-4 h-4 text-[var(--brand-purple)] border-gray-300 focus:ring-[var(--brand-purple)]"
                            />
                            <span className="text-gray-900 font-medium font-dm-sans">
                                {reason.value}
                            </span>
                        </label>
                        {selectedReason === reason.value && (
                            <div className="ml-7">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {reason.prompt}
                                </label>
                                {reason.value === 'Too expensive' ? (
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                                        <input
                                            type="number"
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-purple)] focus:border-transparent text-gray-800"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <textarea
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            placeholder="Please provide more details..."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-purple)] focus:border-transparent resize-none text-gray-800"
                                            rows={4}
                                            minLength={25}
                                            maxLength={1000}
                                        />
                                        <div className="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">
                                            Min 25 Characters ({feedback.length}/25)
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mt-2">
                                    {reason.value === 'Too expensive' ? (
                                        <p className="text-sm text-gray-500 font-dm-sans">
                                            Enter your maximum budget
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="space-y-3 pt-4">
                <button className="w-full px-6 py-3 bg-[#4ABF71] text-white font-bold rounded-lg hover:bg-[#3da562] transition-colors font-dm-sans text-lg">
                    Get $10 off | ${discountedPrice.toFixed(2)} <span className="line-through">${subscriptionPrice.toFixed(2)}</span>
                </button>
                <button
                    onClick={() => {
                        console.log('Complete cancellation button clicked!');
                        console.log('Current state:', { selectedReason, feedback, canContinue, saving });
                        handleContinue();
                    }}
                    disabled={!canContinue || saving}
                    className={`w-full px-6 py-3 rounded-lg transition-colors font-medium font-dm-sans text-base ${
                        canContinue && !saving
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {saving ? 'Saving...' : 'Complete cancellation'}
                </button>
            </div>
        </div>
    );
}
