# Migrate Mate - Cancellation Flow System

## Overview
A comprehensive subscription cancellation flow system built with Next.js, featuring A/B testing for downsell optimization, secure API endpoints, and responsive mobile-first design.

## Architecture Decisions

### 1. **Component-Based Modal Architecture**
- **Single Modal Container**: `SubscriptionCancellationModal` orchestrates all flows
- **Step Components**: Modular components for each step (FoundStep1, NotFoundStep1, etc.)
- **State Management**: Custom hooks (`useCancellationState`, `useCancellationAPI`) for clean separation
- **Flow Navigation**: Utility functions (`getFlowStep`, `getImageVisibility`) for consistent behavior

### 2. **Database Schema Design**
- **Single Table Approach**: `cancellations` table stores all flow data
- **Progressive Patching**: Only relevant fields sent in API requests
- **Variant Persistence**: `downsell_variant` assigned once, reused across sessions
- **Active Row Constraint**: Unique index ensures one active cancellation per user

### 3. **API Route Structure**
- **Server-Only Endpoints**: Supabase service role for database operations
- **CSRF Protection**: Cookie-based token validation
- **Progressive Updates**: PATCH endpoint handles partial data updates
- **Error Handling**: Constraint violation handling with user-friendly messages

## Security Implementation

### 1. **Authentication & Authorization**
- **Server-Side Only**: All database operations use Supabase service role
- **Row Level Security**: RLS policies enforce user data isolation
- **Mock User ID**: Environment variable for development/testing

### 2. **Input Validation & Sanitization**
- **Server-Side Normalization**: UI labels converted to canonical DB tokens
- **Constraint Validation**: Database CHECK constraints prevent invalid data
- **CSRF Protection**: Token validation on all POST requests
- **SQL Injection Prevention**: Supabase client with parameterized queries

### 3. **Data Privacy**
- **User Isolation**: Each user sees only their cancellation data
- **No Stack Traces**: Error responses hide internal implementation details
- **Secure Headers**: Content-Type and CSRF token validation

## A/B Testing Approach

### 1. **Downsell Variant Assignment**
- **Random Assignment**: `crypto.randomInt(0, 2)` for variants A/B
- **Persistent Storage**: Variant stored in database, reused on resume
- **Flow Control**: Variant A skips offer, Variant B shows offer first

### 2. **Variant Logic**
```typescript
// Variant A: Skip offer, go directly to usage survey
if (downsell_variant === 'A') {
  // Navigate to NotFoundStep2 (Usage/Reasons)
}

// Variant B: Show offer first
if (downsell_variant === 'B') {
  if (accepted_downsell === null) {
    // Show NotFoundStep1 (Offer)
  } else if (accepted_downsell === true) {
    // Show DownSellAccepted
  } else {
    // Continue to NotFoundStep2
  }
}
```

### 3. **Success Metrics**
- **Conversion Rate**: Downsell acceptance percentage by variant
- **User Journey**: Flow completion rates for each path
- **Revenue Impact**: Subscription price changes after downsell

## Technical Features

### 1. **Responsive Design**
- **Mobile-First**: Tailwind CSS with mobile-specific layouts
- **Dynamic Modal Sizing**: Width adjusts based on content type
- **Fixed Bottom Buttons**: Mobile-optimized button positioning

### 2. **State Management**
- **Resume Functionality**: Users can continue from where they left off
- **Form Prefilling**: Previous selections restored from database
- **Progressive Validation**: Required fields checked at each step

### 3. **Performance Optimizations**
- **Lazy Loading**: Components loaded only when needed
- **Memoized Hooks**: State updates optimized with React.memo
- **Efficient Queries**: Single database calls for active cancellation data

## Database Schema

```sql
CREATE TABLE cancellations (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  subscription_id INTEGER REFERENCES subscriptions(id),
  found_job BOOLEAN,
  found_with_mm BOOLEAN,
  downsell_variant TEXT CHECK (downsell_variant IN ('A', 'B')),
  accepted_downsell BOOLEAN,
  roles_applied_bucket TEXT CHECK (roles_applied_bucket IN ('0', '1-5', '6-20', '20+')),
  companies_emailed_bucket TEXT CHECK (companies_emailed_bucket IN ('0', '1-2', '3-5', '5+')),
  interviews_bucket TEXT CHECK (interviews_bucket IN ('0', '1-2', '3-5', '5+')),
  has_lawyer BOOLEAN,
  visa TEXT,
  reason TEXT CHECK (reason IN ('too_expensive', 'not_helpful', 'not_relevant', 'not_moving', 'other')),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ensure one active cancellation per user
CREATE UNIQUE INDEX idx_cancellations_active_per_user
ON cancellations (user_id)
WHERE accepted_downsell IS NULL AND reason IS NULL;
```

## Development Setup

```bash
npm install
npm run dev
```

Environment variables required:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MOCK_USER_ID` (for development)
