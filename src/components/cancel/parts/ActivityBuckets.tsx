'use client';

export type BucketA = '0' | '1-5' | '6-20' | '20+';
export type BucketB = '0' | '1-2' | '3-5' | '5+';

type Props = {
  roles_applied_bucket: BucketA | null;
  companies_emailed_bucket: BucketA | null;
  interviews_bucket: BucketB | null;
  onChangeRolesApplied: (v: BucketA) => void;
  onChangeCompaniesEmailed: (v: BucketA) => void;
  onChangeInterviews: (v: BucketB) => void;
  labels?: {
    rolesApplied?: string;
    companiesEmailed?: string;
    interviews?: string;
  };
};

export function ActivityBuckets({
  roles_applied_bucket,
  companies_emailed_bucket,
  interviews_bucket,
  onChangeRolesApplied,
  onChangeCompaniesEmailed,
  onChangeInterviews,
  labels,
}: Props) {
  // Debug: Log the values received
  console.log('ActivityBuckets received values:', {
    roles_applied_bucket,
    companies_emailed_bucket,
    interviews_bucket
  });

  return (
    <div className="space-y-6">
      <BucketRow<BucketA>
        label={labels?.rolesApplied ?? 'How many roles did you apply for through Migrate Mate?'}
        options={['0', '1-5', '6-20', '20+']}
        value={roles_applied_bucket}
        onChange={onChangeRolesApplied}
      />
      <BucketRow<BucketA>
        label={labels?.companiesEmailed ?? 'How many companies did you email directly?'}
        options={['0', '1-5', '6-20', '20+']}
        value={companies_emailed_bucket}
        onChange={onChangeCompaniesEmailed}
      />
      <BucketRow<BucketB>
        label={labels?.interviews ?? 'How many different companies did you interview with?'}
        options={['0', '1-2', '3-5', '5+']}
        value={interviews_bucket}
        onChange={onChangeInterviews}
      />
    </div>
  );
}

function BucketRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  // Debug: Log the selection logic
  console.log(`BucketRow "${label}" - value:`, value, 'options:', options);
  
  return (
    <div>
      <label className="block text-[15px] font-medium text-gray-800 mb-3">
        {label}
      </label>
      <div className="grid grid-cols-4 gap-3">
        {options.map((opt) => {
          const isSelected = value === opt;
          console.log(`Option "${opt}" - isSelected:`, isSelected, 'value === opt:', value === opt);
          
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={[
                'h-10 rounded-md text-[15px] font-medium',
                'transition-all duration-200',
                isSelected
                  ? 'bg-[#9A6FFF] text-white'
                  : 'bg-stone-200/50 text-gray-600 hover:bg-stone-300',
              ].join(' ')}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
