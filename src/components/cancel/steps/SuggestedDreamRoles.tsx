'use client';

import { useEffect, useState } from 'react';

interface SuggestedDreamRolesProps {
    onContinue: () => void;
    onClose: () => void;
}

interface JobRole {
    id: string;
    companyLogo: string;
    companyName: string;
    jobTitle: string;
    location: string;
    salary: string;
    tags: string[];
    description: string;
    contactEmail: string;
    visaSponsorship: {
        greenCard: number;
        e3: number;
        tn: string;
        opt: number;
    };
}

export default function SuggestedDreamRoles({
    onContinue,
    onClose
}: SuggestedDreamRolesProps) {
    // Mock job data - in real app this would come from API
    const jobRoles: JobRole[] = [
        {
            id: '1',
            companyLogo: 'R',
            companyName: 'Randstad USA',
            jobTitle: 'Automation Controls Engineer',
            location: 'Memphis, Tennessee',
            salary: '$150,000/yr - $170,000/yr',
            tags: ['Full Time', 'Associate', "Bachelor's", 'On-Site'],
            description: 'The Electrical Automation Controls Engineer will design, implement, and maintain industrial automation systems, specializing in PLC programming using Siemens TIA Portal. The ideal candidate should have a Bachelor\'s degree in Electrical Engineering and at least 4 years of industrial automation experience. This role offers autonomy and is ideal for someone seeking growth in a supportive company. Key benefits include comprehensive healthcare and retirement plans.',
            contactEmail: 'barbara.tuck@randstadusa.com',
            visaSponsorship: {
                greenCard: 205,
                e3: 1,
                tn: 'CA/MX TN',
                opt: 1
            }
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-dm-sans">
                    Awesome — we've pulled together a few roles that seem like a great fit for you.
                </h2>
                <p className="text-gray-800 text-base md:text-lg font-dm-sans mb-6">
                    Take a look and see what sparks your interest.
                </p>
            </div>

            {/* Job Roles */}
            <div className="space-y-4">
                {jobRoles.map((job) => (
                    <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        {/* Job Header - Company Logo, Job Title, Status & Salary on Left */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex flex-col items-center justify-center text-white">
                                    <span className="font-bold text-lg">{job.companyLogo}</span>
                                    <span className="text-xs">randstad</span>
                                </div>
                                <div>
                                    {/* Job Role on top */}
                                    <h3 className="text-lg font-bold text-gray-900 font-dm-sans mb-2">
                                        {job.jobTitle}
                                    </h3>
                                    {/* Company name below */}
                                    <p className="text-gray-600 text-sm font-dm-sans mb-2">
                                        {job.companyName} • {job.location}
                                    </p>
                                </div>
                            </div>

                            {/* Job Attributes on Right */}
                            <div className="text-right">
                                {/* Job Attribute Tags */}
                                <div className="flex flex-wrap gap-2 mb-4 justify-end">
                                    {job.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-sm rounded-full font-medium font-dm-sans"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* NEW JOB, Salary, and Visa Sponsorship - Horizontal Split */}
                        <div className="flex justify-between items-start mb-4">
                            {/* Left: NEW JOB and Salary */}
                            <div className="flex flex-col items-start">
                                <span className="text-green-600 font-semibold text-sm font-dm-sans mb-1">NEW JOB</span>
                                <p className="text-lg font-bold text-gray-900 font-dm-sans">
                                    {job.salary}
                                </p>
                            </div>

                            {/* Right: Visa Sponsorship */}
                            <div className="text-right">
                                <p className="text-gray-600 text-sm font-dm-sans mb-3">
                                    Visas sponsored by company in the last year
                                </p>
                                <div className="flex flex-wrap gap-3 justify-end">
                                    {/* Green Card */}
                                    <div className="relative">
                                        <div className="absolute -top-2 -right-2 w-7 h-5 bg-white border border-gray-300 rounded-full flex items-center justify-center z-10">
                                            <span className="text-[11px] text-gray-700 font-medium">205</span>
                                        </div>
                                        <div className="flex items-center px-3 py-1 bg-white border border-gray-300 rounded-full">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                            <span className="text-[11px] text-gray-700 font-dm-sans">Green Card</span>
                                        </div>
                                    </div>
                                    {/* AU E-3 */}
                                    <div className="relative">
                                        <div className="absolute -top-2 -right-2 w-7 h-5 bg-white border border-gray-300 rounded-full flex items-center justify-center z-10">
                                            <span className="text-xs text-gray-700 font-medium">1</span>
                                        </div>
                                        <div className="flex items-center px-3 py-1 bg-white border border-gray-300 rounded-full">
                                            <span className="text-[11px] text-gray-700 font-dm-sans">AU E-3</span>
                                        </div>
                                    </div>
                                    {/* CA/MX TN */}
                                    <div className="relative">
                                        <div className="absolute -top-2 -right-2 w-7 h-5 bg-white border border-gray-300 rounded-full flex items-center justify-center z-10">
                                            <span className="text-[11px] text-gray-700 font-medium">+</span>
                                        </div>
                                        <div className="flex items-center px-3 py-1 bg-white border border-gray-300 rounded-full">
                                            <span className="text-[11px] text-gray-700 font-dm-sans">CA/MX TN</span>
                                        </div>
                                    </div>
                                    {/* OPT */}
                                    <div className="relative">
                                        <div className="absolute -top-2 -right-2 w-7 h-5 bg-white border border-gray-300 rounded-full flex items-center justify-center z-10">
                                            <span className="text-xs text-gray-700 font-medium">+</span>
                                        </div>
                                        <div className="flex items-center px-3 py-1 bg-white border border-gray-300 rounded-full">
                                            <svg className="w-4 h-4 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                            </svg>
                                            <span className="text-[11px] text-gray-700 font-dm-sans">OPT</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-800 text-base font-dm-sans mb-4 leading-relaxed">
                            {job.description}
                        </p>

                        {/* Contact Info */}
                        <div className="flex justify-between items-center">
                            <div className="text-gray-600 text-sm font-dm-sans mb-4">
                                Company visa contact: <a href={`mailto:${job.contactEmail}`} className="text-[var(--brand-purple)] underline">{job.contactEmail}</a>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3 items-center">
                                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <button className="px-6 py-2 border border-2 border-[var(--brand-purple)] text-[var(--brand-purple)] rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-semibold font-dm-sans flex items-center gap-2">

                                    Save Job
                                </button>
                                <button className="px-6 py-2 bg-[var(--brand-purple)] text-white rounded-lg hover:bg-[#8a5fff] transition-colors font-medium font-dm-sans">
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <hr className="border-gray-200 m-0" />

            {/* Main CTA Button */}
            <div className="pt-4">
                <button
                    onClick={onClose}
                    className="w-full px-8 py-4 font-medium rounded-lg transition-all duration-200 font-dm-sans text-base bg-[var(--brand-purple)] text-white hover:bg-[#8a5fff]"
                >
                    Land your dream role
                </button>
            </div>
        </div>
    );
}
