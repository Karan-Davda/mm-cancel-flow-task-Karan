export const FLOW_STEPS = {
  FOUND: [1, 2, 3],
  NOT_FOUND: [1, 2, 3]
} as const

export const MODAL_WIDTHS = {
  DEFAULT: 'md:max-w-4xl',
  SUCCESS: 'md:max-w-4xl',
  NOT_FOUND_SUCCESS: 'md:max-w-5xl',
  FOUND_STEP_1: 'md:max-w-4xl',
  FOUND_STEP_2: 'md:max-w-4xl',
  FOUND_STEP_3: 'md:max-w-4xl',
  NOT_FOUND_STEP_1: 'md:max-w-4xl',
  NOT_FOUND_STEP_2: 'md:max-w-4xl',
  NOT_FOUND_STEP_3: 'md:max-w-4xl',
  DOWSELL_ACCEPTED: 'md:max-w-4xl',
  SUGGESTED_DREAM_ROLES: 'md:max-w-6xl'
} as const

export const DESKTOP_IMAGE_WIDTHS = {
  DEFAULT: 'md:w-[350px]',
  SUCCESS: 'md:w-[350px]',
  NOT_FOUND_SUCCESS: 'md:w-[400px]',
  FOUND_STEP_1: 'md:w-[450px]',
  FOUND_STEP_2: 'md:w-[400px]',
  FOUND_STEP_3: 'md:w-[400px]',
  NOT_FOUND_STEP_1: 'md:w-[400px]',
  NOT_FOUND_STEP_2: 'md:w-[400px]',
  NOT_FOUND_STEP_3: 'md:w-[400px]',
  DOWSELL_ACCEPTED: 'md:w-[400px]',
  SUGGESTED_DREAM_ROLES: 'md:w-[500px]'
} as const

export const DOWSELL_VARIANTS = {
  A: 'A',
  B: 'B'
} as const

export const BUCKET_VALUES = {
  ROLES_APPLIED: ['0', '1-5', '6-20', '20+'] as const,
  COMPANIES_EMAILED: ['0', '1-5', '6-20', '20+'] as const,
  INTERVIEWS: ['0', '1-2', '3-5', '5+'] as const
} as const

export const SUBSCRIPTION_PRICE = {
  DEFAULT: 25,
  DISCOUNT: 10
} as const
