# Finpace Technology - AI Coding Agent Instructions

## Project Overview

Finpace is a React/TypeScript financial technology platform for investment advisors, firms, and clients to create, sign, and manage documents. The app facilitates onboarding, form management, e-signatures, and client communication.

## Architecture & Key Patterns

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Material-UI
- **State Management**: Redux Toolkit with normalized state (byId/allIds pattern)
- **Authentication**: AWS Amplify with custom Cognito flow
- **Styling**: Material-UI with custom theme system
- **Forms**: FormIO-based dynamic form builder and renderer
- **E-signatures**: DocuSign integration via envelopes
- **Storage**: AWS S3 via Amplify Storage

### User Role Hierarchy

The app has a strict role-based access system defined in `src/constants/users.ts`:

- `CLIENT` - End users filling out forms
- `ADVISOR` - Financial advisors managing clients
- `FIRM_ADMIN` - Admin users managing firms and advisors
- Special case: `FIRM_ADMIN` can also be an advisor (`isAdvisor: true`)

### State Management Structure

Redux store follows normalized patterns with consistent slice structure:

```typescript
// Example: src/redux/slices/clients.ts
{
  isLoading: boolean,
  error: string | null,
  byId: { [id: string]: EntityType },
  allIds: string[]
}
```

Key slices: `clients`, `advisors`, `firms`, `forms`, `templates`, `envelopes`

### Form System Architecture

The form system is central to the application:

- **Templates** (`src/@types/template.ts`): Reusable FormIO configurations
- **Forms** (`src/@types/form.ts`): Template instances with user data
- **Envelopes** (`src/@types/envelope.ts`): DocuSign signing containers
- **Dynamic Fields**: Custom fields per firm in `firm.clientFields`

### File Structure Conventions

- `src/pages/` - Route components
- `src/sections/@dashboard/` - Feature-specific components
- `src/components/` - Reusable UI components
- `src/hooks/` - Custom React hooks
- `src/utils/` - Pure utility functions
- `src/@types/` - TypeScript definitions
- `src/constants/` - App constants and enums

## Development Workflows

### Local Development

```bash
yarn install
yarn start  # Runs on localhost:3000
```

### Environment Configuration

- Requires `.env` file with AWS/API credentials (ask team)
- Uses `src/config.ts` for environment-specific settings
- Stage detection: `dev`, `staging`, `prod` based on hostname

### Key Hooks & Utilities

- `useUser()` - Current authenticated user and profile data
- `useAuth()` - Amplify authentication state/methods
- `useForm(formId)` - Form data from Redux store
- `useUserFromStore(userId, role)` - Any user by ID and role
- `arrayFromObj(byId, allIds)` - Convert normalized state to arrays

### Form Development Patterns

When working with forms:

1. Always check user role permissions (`roles.ADVISOR`, `roles.CLIENT`, etc.)
2. Use `FormRenderer` for displaying forms, `FormBuilder` for editing
3. Handle form status transitions: `DRAFT` → `SENT` → `COMPLETED`
4. Consider reviewer workflow: forms can have multiple reviewers

### API Integration

- AWS Amplify API with custom headers (`src/config.ts`)
- All API calls in Redux slices follow the pattern:
  ```typescript
  dispatch(slice.actions.startLoading());
  try {
    const response = await API.get('bitsybackendv2', url, {});
    dispatch(slice.actions.successAction(response));
  } catch (error) {
    Sentry.captureException(error);
    dispatch(slice.actions.hasError(error));
  }
  ```

## Critical Business Logic

### Form Review Workflow

Forms have a multi-step review process:

1. `DRAFT` - Being filled out
2. `SENT` - Awaiting review (advisor or client)
3. `COMPLETED` - All reviews complete
4. Can be `CANCELLED` at any point

Track current reviewer with `form.currentReviewerRole` and `form.reviewers[]`

### Client vs Prospect Distinction

Clients can be marked as `isProspect: true` for sales pipeline management. This affects:

- Navigation paths (`/customers` vs `/prospects`)
- Available actions
- Form accessibility

### Firm-Specific Customization

- Firms have custom client fields in `firm.clientFields`
- Some features are firm-specific (see `src/utils/firm.ts`)
- White-labeling via `BrandProvider` context

### E-Signature Integration

DocuSign integration via "envelopes":

- Forms can generate envelopes for signing
- Envelopes have multiple signers with roles
- Status tracking: `SENT` → `DELIVERED` → `COMPLETED`

## Common Gotchas

1. **Role Checking**: Always use role constants, not strings: `roles.ADVISOR` not `"advisor"`
2. **Form State**: Check form status before allowing actions - forms in `COMPLETED` state are read-only
3. **Firm Context**: Many features require firm-specific settings - check `firm.id` availability
4. **Array vs Object**: Redux state is normalized - use `arrayFromObj()` to convert to arrays
5. **Authentication**: Amplify uses custom challenge flow - handle accordingly in auth components
6. **File Uploads**: Use AWS S3 paths following the pattern: `clients/{clientId}/images/{type}`

## Testing Accounts

- **Firm Admin**: test+firmadmin@bitsyadvisor.com / `Password123!`
- **Advisor**: test+advisor@bitsyadvisor.com / `Password123!`
- **Client**: test+client@bitsyadvisor.com / `Password123!`

## Key Integrations

- **FormIO**: Dynamic form builder/renderer
- **DocuSign**: E-signature workflow
- **AWS Amplify**: Auth, API, Storage
- **Sentry**: Error tracking
- **Material-UI**: Component library
- **Redux Persist**: State persistence
