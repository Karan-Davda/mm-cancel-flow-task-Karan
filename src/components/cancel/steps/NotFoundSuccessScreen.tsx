'use client';

interface NotFoundSuccessScreenProps {
    onBackToJobs: () => void;
    endDate?: string;
}

export default function NotFoundSuccessScreen({
    onBackToJobs,
    endDate = 'your billing date'
}: NotFoundSuccessScreenProps) {
    return (
        <div className="space-y-6">
            {/* Main Content */}
            <div className="space-y-6 text-left">
                {/* Main Heading */}
                <div className="m-0">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-dm-sans">
                        Sorry to see you go, mate.
                    </h3>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 font-dm-sans">
                        Thanks for being with us, and you're always welcome back.
                    </p>
                </div>

                {/* Cancellation Details */}
                <div className="mt-2">
                    <p className="text-gray-800 text-sm font-semibold md:text-sm font-dm-sans leading-relaxed">
                        Your subscription is set to end on <span className="font-semibold">{endDate}</span>.
                        You'll still have full access until then. No further charges after that.
                    </p>

                    <p className="text-gray-800 text-sm md:text-sm font-dm-sans leading-relaxed mt-4">
                        Changed your mind? You can reactivate anytime before your end date.
                    </p>
                </div>

                <hr className="my-4 border-gray-300" />

                {/* Call to Action Button */}
                <div className="">
                    <button
                        onClick={onBackToJobs}
                        className="w-full px-8 py-4 font-medium rounded-lg transition-all duration-200 font-dm-sans text-base bg-[var(--brand-purple)] text-white hover:bg-[#8a5fff]"
                    >
                        Back to Jobs
                    </button>
                </div>
            </div>
        </div>
    );
}
