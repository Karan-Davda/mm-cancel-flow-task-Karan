'use client';

import { useEffect, useState } from 'react';
import { ActivityBuckets } from '../parts/ActivityBuckets';

interface NotFoundStep2Props {
    roles_applied_bucket: '0' | '1-5' | '6-20' | '20+' | null;
    companies_emailed_bucket: '0' | '1-5' | '6-20' | '20+' | null;
    interviews_bucket: '0' | '1-2' | '3-5' | '5+' | null;
    onChangeRolesApplied: (value: '0' | '1-5' | '6-20' | '20+') => void;
    onChangeCompaniesEmailed: (value: '0' | '1-5' | '6-20' | '20+') => void;
    onChangeInterviews: (value: '0' | '1-2' | '3-5' | '5+') => void;
    onContinue: () => void;
    onGetDiscount: () => void;
    saving: boolean;
    error: string | null;
}

export default function NotFoundStep2({
    roles_applied_bucket,
    companies_emailed_bucket,
    interviews_bucket,
    onChangeRolesApplied,
    onChangeCompaniesEmailed,
    onChangeInterviews,
    onContinue,
    onGetDiscount,
    saving,
    error
}: NotFoundStep2Props) {
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

    // Check if all buckets are selected
    const canContinue = roles_applied_bucket && companies_emailed_bucket && interviews_bucket;

    return (
        <div className="space-y-6 pb-30 md:pb-0">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 font-dm-sans">
                    How has your job search been going?
                </h2>
                <p className="text-gray-800 text-base md:text-lg font-dm-sans">
                    This helps us understand how to better support you.
                </p>
            </div>

            <ActivityBuckets
                roles_applied_bucket={roles_applied_bucket}
                companies_emailed_bucket={companies_emailed_bucket}
                interviews_bucket={interviews_bucket}
                onChangeRolesApplied={onChangeRolesApplied}
                onChangeCompaniesEmailed={onChangeCompaniesEmailed}
                onChangeInterviews={onChangeInterviews}
            />

            {error && (
                <div className="text-red-600 text-sm font-medium text-center font-dm-sans">
                    {error}
                </div>
            )}

            {/* $10 Off Button */}
            <div className="md:static pt-3 fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:p-0 md:shadow-none md:border-none">
                <button
                    onClick={onGetDiscount}
                    disabled={saving || loading}
                    className="w-full bg-[#4ABF71] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#3da562] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-dm-sans text-lg mb-3"
                >
                    {loading ? 'Loading...' : 'Get $10 off'}
                </button>

                {/* Continue Button */}

                <button
                    onClick={onContinue}
                    disabled={!canContinue || saving}
                    className={`w-full px-8 py-4 font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed font-dm-sans text-base ${canContinue && !saving
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-300 text-gray-500'
                        }`}
                >
                    {saving ? 'Saving...' : 'Continue'}
                </button>
            </div>
        </div>
    );
}
