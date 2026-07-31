# Testing Plan: Backend Phase 2

## 1. Database & Migration Testing
- **Test ID:** DB-001
- **Preconditions:** Fresh local PostgreSQL instance.
- **Steps:** Run `npx prisma db push` and `npx prisma generate`.
- **Expected Result:** Models are created in the database without errors.
- **Pass Criteria:** The schema can be introspected, and constraints (like foreign keys) are enforced at the DB level.

## 2. Authentication Testing (Multi-tenancy)
- **Test ID:** AUTH-001
- **Preconditions:** Two distinct users belonging to two different Organizations exist in the DB.
- **Steps:**
  1. Login as User A. Create a Competitor.
  2. Logout.
  3. Login as User B. Fetch the Competitor list.
- **Expected Result:** User B receives an empty list or only competitors belonging to their Organization.
- **Pass Criteria:** Strict multi-tenant isolation enforced by the `orgId`. `401/403` status codes for invalid access.

## 3. API CRUD Testing
- **Test ID:** API-001
- **Preconditions:** Valid JWT session token available in Postman or cURL.
- **Steps:**
  1. POST to `/api/v1/competitors` with valid data.
  2. POST to `/api/v1/competitors/:id/products` for the created competitor.
  3. GET the competitor details.
  4. DELETE the competitor.
- **Expected Result:** All endpoints return 2xx success codes using the standard API Response Envelope (`{ success, data, meta, error }`). Deleting the competitor successfully cascades and deletes the associated products.
- **Pass Criteria:** JSON payload strictly matches the API Response Envelope and DTO schemas. DB verifies deletion.

## 4. Frontend Integration Testing
- **Test ID:** FE-001
- **Preconditions:** Backend APIs are running locally. Development seed data is loaded.
- **Steps:**
  1. Navigate to `/dashboard/competitors` in the browser.
  2. Observe the network tab and the UI.
- **Expected Result:** The UI renders flawlessly based on the database data instead of the inline mock arrays.
- **Pass Criteria:** No React hydration errors. The table populates correctly.

## 5. Pagination & Search Testing
- **Test ID:** SRCH-001
- **Preconditions:** At least 15 competitors exist for the current user's organization.
- **Steps:**
  1. Navigate to `/dashboard/competitors`.
  2. Verify 10 competitors load on page 1.
  3. Click "Next". Verify competitors 11-15 load.
  4. Type a search query for a specific competitor into the search bar.
- **Expected Result:** Pagination successfully limits records. Search correctly filters the result set to the specific query.
- **Pass Criteria:** Network requests include `?page=x` and `?search=y`. The UI updates without full page reloads.

## 6. Regression Testing
- **Test ID:** REG-001
- **Preconditions:** Backend Phase 1 features intact.
- **Steps:** Test Login, Register, Logout, and the `/api/v1/health` endpoint.
- **Expected Result:** All Phase 1 functionality remains operational.
- **Pass Criteria:** Users can still authenticate and navigate via the NextAuth proxy.

## 7. Production Build Verification
- **Test ID:** BLD-001
- **Preconditions:** Code is fully committed.
- **Steps:** Run `npm run build` in the root directory.
- **Expected Result:** The build completes successfully.
- **Pass Criteria:** Zero TypeScript compilation errors. Zero ESLint warnings/errors. Next.js static and dynamic routing tree validates.
