'use client';

interface FoundStep2Props {
    feedback: string;
    onChangeFeedback: (value: string) => void;
    onContinue: () => void;
    saving: boolean;
    error: string | null;
}

export default function FoundStep2({
    feedback,
    onChangeFeedback,
    onContinue,
    saving,
    error
}: FoundStep2Props) {
    const canContinue = feedback.length >= 25;

    return (
        <div className="space-y-6 pb-32 md:pb-0">
            {/* Main Question */}
            <h2 className="text-2xl md:text-2xl font-bold text-gray-900 mb-4 font-dm-sans">
                What's one thing you wish we could've helped you with?
            </h2>
            
            <p className="text-gray-800 text-base md:text-base font-dm-sans mb-6">
                We're always looking to improve, your thoughts can help us make Migrate Mate more useful for others.*
            </p>

            <div className="relative">
                <textarea
                    value={feedback}
                    onChange={(e) => onChangeFeedback(e.target.value)}
                    placeholder="Type your feedback here..."
                    className="w-full m-0 h-40 md:h-30 p-4 pr-20 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-dm-sans text-gray-900 text-base"
                    disabled={saving}
                />
                
                {/* Character Count - Inside textarea */}
                <div className="absolute bottom-3 right-3 pointer-events-none">
                    <span className={`text-sm font-dm-sans ${feedback.length >= 25 ? 'text-gray-500' : 'text-red-500'}`}>
                        Min 25 characters ({feedback.length}/25)
                    </span>
                </div>
            </div>

            {/* Continue Button - Fixed at bottom for mobile only */}
            <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-[9999] w-full">
                <div className="w-full">
                    <button
                        onClick={onContinue}
                        disabled={!canContinue || saving}
                        className={`w-full px-8 py-4 font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed font-dm-sans text-base ${
                            canContinue && !saving
                                ? 'bg-[#4ABF71] text-white hover:bg-[#3da562]'
                                : 'bg-gray-300 text-gray-500'
                        }`}
                    >
                        {saving ? 'Saving...' : 'Continue'}
                    </button>

                    {/* Error Message */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 font-dm-sans">{error}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Continue Button - Desktop version (inline) */}
            <div className="hidden md:block">
                <button
                    onClick={onContinue}
                    disabled={!canContinue || saving}
                    className={`w-full px-8 py-4 font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed font-dm-sans text-base ${
                        canContinue && !saving
                            ? 'bg-[#4ABF71] text-white hover:bg-[#3da562]'
                            : 'bg-gray-300 text-gray-500'
                    }`}
                >
                    {saving ? 'Saving...' : 'Continue'}
                </button>

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 font-dm-sans">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
