'use client';

import { useEffect, useState } from 'react';

interface DownSellAcceptedProps {
    onContinue: () => void;
    daysLeft?: number;
    nextBillingDate?: string;
}

export default function DownSellAccepted({
    onContinue,
    daysLeft = 30,
    nextBillingDate = '2024-02-01'
}: DownSellAcceptedProps) {
    const [subscriptionPrice, setSubscriptionPrice] = useState<number>(25);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubscriptionPrice = async () => {
            try {
                setLoading(true);
                // Fetch subscription price from API
                const response = await fetch('/api/subscription/price');
                if (response.ok) {
                    const data = await response.json();
                    // Convert cents to dollars
                    setSubscriptionPrice(data.priceCents / 100);
                } else {
                    // Fallback to default
                    setSubscriptionPrice(25);
                }
            } catch (error) {
                console.error('Error fetching subscription price:', error);
                // Fallback to default
                setSubscriptionPrice(25);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptionPrice();
    }, []);

    const discountedPrice = subscriptionPrice - 10; // $10 off

    if (loading) {
        return (
            <div className="space-y-6 text-left">
                <div className="pl-2 pt-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-dm-sans">
                        Great choice, mate!
                    </h2>
                    <p className="text-gray-900 text-2xl md:text-3xl font-dm-sans mb-6">
                        You're still on the path to your dream role.{' '}
                        <span className="text-[var(--brand-purple)] font-semibold">
                            Let's make it happen together!
                        </span>
                    </p>
                </div>

                <div className="space-y-3 text-left rounded-lg pl-2">
                    <p className="text-gray-800 text-md font-dm-sans">
                        Loading subscription details...
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6 text-left pb-38 md:pb-0">
            {/* City Skyline Image - Mobile View */}
            <div className="block md:hidden w-full h-44 relative">
                <img
                    src="/image/empire-state-compressed.jpg"
                    alt="New York City skyline with Empire State Building"
                    className="w-full h-full object-cover rounded-lg shadow-2xl"
                    style={{
                        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.3)'
                    }}
                />
            </div>

            {/* Confirmation Content */}
            <div className="pl-2 pt-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-dm-sans">
                    Great choice, mate!
                </h2>
                <p className="text-gray-900 text-2xl md:text-3xl font-dm-sans mb-6">
                    You're still on the path to your dream role.{' '}
                    <span className="text-[var(--brand-purple)] font-semibold">
                        Let's make it happen together!
                    </span>
                </p>
            </div>

            {/* Details */}
            <div className="space-y-3 text-left rounded-lg pl-2">
                <p className="text-gray-800 text-md font-dm-sans">
                    You've got <span className="font-semibold">{daysLeft} days</span> left on your current plan.
                    <br/>
                    Starting from <span className="font-semibold">{nextBillingDate}</span>, your monthly payment will be{' '}
                    <span className="font-semibold">${discountedPrice.toFixed(2)}</span>.
                </p>
                <p className="text-gray-500 text-sm font-dm-sans pt-2">
                    You can cancel anytime before then.
                </p>
            </div>

            <hr className="border-gray-200"/>
            
            {/* Continue Button */}
            <div className="md:static fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 md:p-0 md:shadow-none md:border-none">
                <button
                    onClick={onContinue}
                    className="w-full px-8 py-4 font-medium rounded-lg transition-all duration-200 font-dm-sans text-base bg-[var(--brand-purple)] text-white hover:bg-[#8a5fff] md:mb-0"
                >
                    Land your dream role
                </button>
            </div>
        </div>
    );
}
