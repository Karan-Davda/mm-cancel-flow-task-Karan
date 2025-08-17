'use client';

interface FoundSuccessScreenProps {
    has_lawyer: boolean | null;
    onFinish: () => void;
}

export default function FoundSuccessScreen({
    has_lawyer,
    onFinish
}: FoundSuccessScreenProps) {
    return (
        <div className="space-y-6">
            {/* Content based on lawyer selection */}
            {has_lawyer === true ? (
                // Yes - Lawyer provided (First Design)
                <div className="text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-dm-sans mb-4">
                        All done, your cancellation's been processed.
                    </h3>
                    <p className="text-gray-800 text-base md:text-lg font-dm-sans mb-6">
                        We're stoked to hear you've landed a job and sorted your visa. Big congrats from the team. 🙌
                    </p>
                </div>
            ) : (
                // No - No lawyer provided (Second Design)
                <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-dm-sans text-left">
                        Your cancellation's all sorted, mate, no more charges.
                    </h3>
                    
                    {/* Contact Card */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                <img
                                    src="/image/mihailo-profile.jpeg"
                                    alt="Mihailo Bozic"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 font-dm-sans">Mihailo Bozic</h4>
                                <p className="text-gray-600 text-sm font-dm-sans mb-3"><span>&lt;</span>mihailo@migratemate.co&gt;</p>
                                <p className="text-gray-800 text-sm font-semibold font-dm-sans mb-2">
                                    I'll be reaching out soon to help with the visa side of things.
                                </p>
                                <p className="text-gray-800 text-sm font-dm-sans pt-2">
                                    We've got your back, whether it's questions, paperwork, or just figuring out your options.
                                </p>
                                <p className="text-gray-800 text-sm font-dm-sans pt-4">
                                    Keep an eye on your inbox, I'll be in touch <span className="underline">shortly</span>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Finish Button */}
            <div>
                <button
                    onClick={onFinish}
                    className="w-full px-8 py-4 font-medium rounded-lg transition-all duration-200 font-dm-sans text-base bg-[var(--brand-purple)] text-white hover:bg-[#8a5fff]"
                >
                    Finish
                </button>
            </div>
        </div>
    );
}
