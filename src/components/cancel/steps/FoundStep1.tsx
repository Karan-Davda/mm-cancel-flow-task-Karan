import { ActivityBuckets } from '../parts/ActivityBuckets';

type BucketA = '0' | '1-5' | '6-20' | '20+';
type BucketB = '0' | '1-2' | '3-5' | '5+';

interface FoundStep1Props {
  found_with_mm: boolean | null;
  onChangeFoundWithMM: (v: boolean) => void;

  roles_applied_bucket: BucketA | null;
  companies_emailed_bucket: BucketA | null;
  interviews_bucket: BucketB | null;

  onChangeRolesApplied: (v: BucketA) => void;
  onChangeCompaniesEmailed: (v: BucketA) => void;
  onChangeInterviews: (v: BucketB) => void;

  onContinue: () => void;
  saving: boolean;
  error: string | null;
}

export default function FoundStep1({
  found_with_mm,
  onChangeFoundWithMM,
  roles_applied_bucket,
  companies_emailed_bucket,
  interviews_bucket,
  onChangeRolesApplied,
  onChangeCompaniesEmailed,
  onChangeInterviews,
  onContinue,
  saving,
  error
}: FoundStep1Props) {
  // Check if all fields are filled to enable continue button
  const canContinue = found_with_mm !== null && 
                     roles_applied_bucket !== null && 
                     companies_emailed_bucket !== null && 
                     interviews_bucket !== null;

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* Header with confetti emoji */}
      <div className="text-left">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-dm-sans">
            Congrats on the new role!
          </h2>
          <span className="text-2xl md:text-3xl">🎉</span>
        </div>
      </div>

      {/* Question 1: Did you find this job with MigrateMate? */}
      <div>
        <p className="text-sm font-medium text-gray-900 mb-3 font-dm-sans">
          Did you find this job with MigrateMate?*
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => onChangeFoundWithMM(true)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 font-dm-sans h-10 ${
              found_with_mm === true
                ? 'bg-[#9A6FFF] text-white'
                : 'bg-stone-200/50 text-gray-600 hover:bg-stone-300'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => onChangeFoundWithMM(false)}
            className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 font-dm-sans h-10 ${
              found_with_mm === false
                ? 'bg-[#9A6FFF] text-white'
                : 'bg-stone-200/50 text-gray-600 hover:bg-stone-300'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Activity Buckets */}
      <ActivityBuckets
        roles_applied_bucket={roles_applied_bucket}
        companies_emailed_bucket={companies_emailed_bucket}
        interviews_bucket={interviews_bucket}
        onChangeRolesApplied={onChangeRolesApplied}
        onChangeCompaniesEmailed={onChangeCompaniesEmailed}
        onChangeInterviews={onChangeInterviews}
      />

      {/* Divider */}
      <hr className="border-gray-300 my-3 hidden md:block" />

      {/* Continue Button - Fixed at very bottom for mobile only */}
      <div className="block md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 mb-0 z-[9999] w-full">
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
      <div className="hidden md:block pt-4">
        <button
          onClick={onContinue}
          disabled={!canContinue || saving}
          className={`h-13 w-full px-8 py-4 font-medium rounded-lg transition-all duration-200 disabled:cursor-not-allowed font-dm-sans text-base ${
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
