'use client';

import { useEffect, useState } from 'react';

interface NotFoundStep1Props {
    onAcceptDownsell: () => void;
    onDeclineDownsell: () => void;
    saving: boolean;
}

export default function NotFoundStep1({
    onAcceptDownsell,
    onDeclineDownsell,
    saving
}: NotFoundStep1Props) {
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

    const discountedPrice = Math.max(0, subscriptionPrice - 10); // $10 off, minimum 0
    
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-dm-sans">
                        We built this to help you land the job, this makes it a little easier.
                    </h2>
                    <p className="text-gray-800 text-base md:text-lg font-dm-sans mb-6">
                        We've been there and we're here to help you.
                    </p>
                </div>

                <div className="text-center">
                    <p className="text-gray-600">Loading subscription details...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6 pb-24 md:pb-0">
            {/* Offer Content */}
            <div className="text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-dm-sans">
                    We built this to help you land the job, this makes it a little easier.
                </h2>
                <p className="text-gray-800 text-lg md:text-xl font-dm-sans mb-6">
                    We've been there and we're here to help you.
                </p>
            </div>

            {/* Offer Box */}
            <div className="border-2 border-[var(--brand-purple)] rounded-lg p-3 text-center bg-[var(--brand-purple)]/20">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 font-dm-sans">
                    Here's <span className="font-bold">$10 off</span> until you find a job.
                </h3>
                <div className="mb-4">
                    <span className="text-xl md:text-2xl font-bold text-[var(--brand-purple)] font-dm-sans">
                        ${discountedPrice.toFixed(2)}/month
                    </span>
                    <span className="text-lg md:text-xl text-gray-500 line-through ml-2 font-dm-sans">
                        ${subscriptionPrice.toFixed(2)}/month
                    </span>
                </div>
                <button
                    onClick={onAcceptDownsell}
                    disabled={saving}
                    className="w-full bg-[#4ABF71] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#3da562] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-dm-sans text-lg"
                >
                    Get $10 off
                </button>
                <p className="text-sm text-gray-600 mt-2 font-dm-sans">
                    You won't be charged until your next billing date
                </p>
            </div>

            {/* Decline Option */}
            <div className="md:static fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 md:p-0 md:shadow-none md:border-none">
                <button
                    onClick={onDeclineDownsell}
                    disabled={saving}
                    className="px-6 py-2 border border-gray-300 text-gray-800 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium font-dm-sans w-full"
                >
                    No thanks
                </button>
            </div>
        </div>
    );
}
