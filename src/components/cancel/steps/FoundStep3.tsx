'use client';

import { useState } from 'react';

interface FoundStep3Props {
    found_through_mm: boolean;
    has_lawyer: boolean | null;
    onChangeHasLawyer: (value: boolean) => void;
    visa: string;
    onChangeVisa: (value: string) => void;
    onContinue: () => void;
    saving: boolean;
    error: string | null;
}

export default function FoundStep3({
    found_through_mm,
    has_lawyer,
    onChangeHasLawyer,
    visa,
    onChangeVisa,
    onContinue,
    saving,
    error
}: FoundStep3Props) {
    const canContinue = has_lawyer !== null && visa.trim().length > 0;
    const [isDropdownOpenYes, setIsDropdownOpenYes] = useState(false);
    const [isDropdownOpenNo, setIsDropdownOpenNo] = useState(false);
    const [searchTermYes, setSearchTermYes] = useState('');
    const [searchTermNo, setSearchTermNo] = useState('');

    // Common US visa types (excluding F1, but including F1-OPT)
    const visaTypes = [
        'F1-OPT',
        'H-1B',
        'H-2B',
        'H-3',
        'L-1A',
        'L-1B',
        'L-2',
        'O-1',
        'P-1',
        'P-2',
        'P-3',
        'Q-1',
        'R-1',
        'TN',
        'E-1',
        'E-2',
        'E-3',
        'J-1',
        'M-1',
        'Other'
    ];

    // Filter visa types based on search term
    const filteredVisaTypesYes = visaTypes.filter(type => 
        type.toLowerCase().includes(searchTermYes.toLowerCase())
    );
    
    const filteredVisaTypesNo = visaTypes.filter(type => 
        type.toLowerCase().includes(searchTermNo.toLowerCase())
    );

    const handleVisaSelect = (visaType: string, isYesDropdown: boolean) => {
        onChangeVisa(visaType);
        if (isYesDropdown) {
            setIsDropdownOpenYes(false);
            setSearchTermYes('');
        } else {
            setIsDropdownOpenNo(false);
            setSearchTermNo('');
        }
    };

    return (
        <div className="space-y-4 pb-40 md:pb-0">
            {/* Main Heading - Conditional based on found_through_mm */}
            {found_through_mm ? (
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-dm-sans">
                    We helped you land the job, now let's help you secure your visa.
                </h2>
            ) : (
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-dm-sans">
                        You landed the job!
                    </h2>
                    <h3 className="text-2xl md:text-3xl font-bold italic text-gray-900 font-dm-sans">
                        That's what we live for.
                    </h3>
                    <p className="text-gray-800 font-semibold text-base mt-2 md:text-base font-dm-sans">
                        Even if it wasn't through Migrate Mate, let us help get your visa sorted.
                    </p>
                </div>
            )}

            {/* Question 1: Immigration Lawyer */}
            <div>
                <p className="text-gray-800 text-base md:text-sm font-dm-sans mb-3">
                    Is your company providing an immigration lawyer to help with your visa?
                </p>
                
                {/* Yes Radio Button */}
                <div className="mb-2">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="has_lawyer"
                            value="true"
                            checked={has_lawyer === true}
                            onChange={() => onChangeHasLawyer(true)}
                            disabled={saving}
                            className="w-4 h-4 text-[#9A6FFF] bg-gray-100 border-gray-300 focus:ring-[#9A6FFF] focus:ring-2"
                        />
                        <span className="ml-3 text-gray-800 font-dm-sans">Yes</span>
                    </label>
                </div>

                {/* Visa Question for Yes - Appears between Yes and No */}
                {has_lawyer === true && (
                    <div className="mb-4 ml-7">
                        <p className="text-gray-800 text-base md:text-sm font-dm-sans mb-3">
                            What visa will you be applying for?*
                        </p>
                        
                        {/* Combined Search and Dropdown */}
                        <div className="relative">
                            <div className="w-full p-3 border border-gray-300 rounded-lg bg-white flex items-center justify-between">
                                <input
                                    type="text"
                                    placeholder="Search or select visa type..."
                                    value={visa || searchTermYes}
                                    onChange={(e) => setSearchTermYes(e.target.value)}
                                    className="flex-1 border-none outline-none focus:outline-none text-gray-900"
                                    onClick={() => setIsDropdownOpenYes(true)}
                                />
                                <svg 
                                    className={`w-5 h-5 text-gray-400 transition-transform cursor-pointer ${isDropdownOpenYes ? 'rotate-180' : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    onClick={() => setIsDropdownOpenYes(!isDropdownOpenYes)}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            
                            {isDropdownOpenYes && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                    {/* Options List */}
                                    <div className="py-1">
                                        {filteredVisaTypesYes.map((visaType) => (
                                            <div
                                                key={visaType}
                                                className={`px-3 py-2 cursor-pointer hover:bg-[var(--brand-purple)] text-gray-800 hover:text-white transition-colors ${
                                                    visa === visaType ? 'bg-[var(--brand-purple)] text-white' : ''
                                                }`}
                                                onClick={() => handleVisaSelect(visaType, true)}
                                            >
                                                {visaType}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* No Radio Button */}
                <div className="mb-2">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="has_lawyer"
                            value="false"
                            checked={has_lawyer === false}
                            onChange={() => onChangeHasLawyer(false)}
                            disabled={saving}
                            className="w-4 h-4 text-[#9A6FFF] bg-gray-100 border-gray-300 focus:ring-[#9A6FFF] focus:ring-2"
                        />
                        <span className="ml-3 text-gray-800 font-dm-sans">No</span>
                    </label>
                </div>

                {/* Visa Question for No - Appears below No option */}
                {has_lawyer === false && (
                    <div className="mt-3">
                        <p className="text-gray-800 text-base md:text-sm font-dm-sans mb-3">
                            We can connect you with one of our trusted partners.
                        </p>
                        <p className="text-gray-800 text-base md:text-sm font-dm-sans mb-3">
                            Which visa would you like to apply for?*
                        </p>
                        
                        {/* Combined Search and Dropdown */}
                        <div className="relative">
                            <div className="w-full p-3 border border-gray-300 rounded-lg bg-white flex items-center justify-between">
                                <input
                                    type="text"
                                    placeholder="Search or select visa type..."
                                    value={visa || searchTermNo}
                                    onChange={(e) => setSearchTermNo(e.target.value)}
                                    className="flex-1 border-none outline-none focus:outline-none text-gray-900"
                                    onClick={() => setIsDropdownOpenNo(true)}
                                />
                                <svg 
                                    className={`w-5 h-5 text-gray-400 transition-transform cursor-pointer ${isDropdownOpenNo ? 'rotate-180' : ''}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    onClick={() => setIsDropdownOpenNo(!isDropdownOpenNo)}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                            
                            {isDropdownOpenNo && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                    {/* Options List */}
                                    <div className="py-1">
                                        {filteredVisaTypesNo.map((visaType) => (
                                            <div
                                                key={visaType}
                                                className={`px-3 py-2 cursor-pointer hover:bg-[var(--brand-purple)] text-gray-800 hover:text-white transition-colors ${
                                                    visa === visaType ? 'bg-[var(--brand-purple)] text-white' : ''
                                                }`}
                                                onClick={() => handleVisaSelect(visaType, false)}
                                            >
                                                {visaType}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Continue Button - Fixed at bottom for mobile only */}
            <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 mb-0 p-4 z-[9999] w-full">
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
                        {saving ? 'Saving...' : 'Complete cancellation'}
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
            <div className="hidden md:block pt-4">
                <button
                    onClick={onContinue}
                    disabled={!canContinue || saving}
                    className={`w-full px-8 py-4 font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed font-dm-sans text-base ${
                        canContinue && !saving
                            ? 'bg-[#4ABF71] text-white hover:bg-[#3da562]'
                            : 'bg-gray-300 text-gray-500'
                    }`}
                >
                    {saving ? 'Saving...' : 'Complete cancellation'}
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
