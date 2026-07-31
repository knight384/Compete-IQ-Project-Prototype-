# Development Checklist: Backend Phase 2

## Milestone 2.1: Database Design
- [ ] **Objective:** Extend Prisma schema for Core Entities and seed initial data.
- [ ] **Dependencies:** None.
- [ ] **Deliverables:**
  - `schema.prisma` updated with `Competitor`, `Product`, and `Feature` models.
  - Initial Prisma migration generated.
  - Development seed data (`prisma/seed.ts`).
- [ ] **Completion Criteria:** `npx prisma migrate dev` succeeds and seed script populates DB without errors.
- [ ] **Testing Requirements:** DB-001 (Schema introspection and constraint verification).

## Milestone 2.2: Repositories
- [ ] **Objective:** Implement the data access layer for all models.
- [ ] **Dependencies:** Milestone 2.1.
- [ ] **Deliverables:**
  - `competitor.repository.ts`, `product.repository.ts`, `feature.repository.ts`
- [ ] **Completion Criteria:** All database access is isolated to repositories. `orgId` filtering is enforced in all applicable queries.
- [ ] **Testing Requirements:** Repository unit tests (or manual verification of DB calls).

## Milestone 2.3: Services
- [ ] **Objective:** Implement business logic, transactions, and mappers.
- [ ] **Dependencies:** Milestone 2.2.
- [ ] **Deliverables:**
  - `competitor.service.ts`, `product.service.ts`, `feature.service.ts`
  - Mapper layer implemented (`*.mapper.ts`).
  - Business rules enforced (e.g., uniqueness checks).
  - Transactions implemented for nested creation.
- [ ] **Completion Criteria:** Services correctly call repositories, handle transactions, and return mapped domain objects, throwing Domain Errors when appropriate.
- [ ] **Testing Requirements:** Service logic validation.

## Milestone 2.4: REST APIs
- [ ] **Objective:** Implement the Route Handlers.
- [ ] **Dependencies:** Milestone 2.3.
- [ ] **Deliverables:**
  - Route Handlers (`app/api/v1/competitors/route.ts`, etc.).
  - Authentication and Authorization (`orgId` enforcement).
  - Payload validation using Zod DTOs.
- [ ] **Completion Criteria:** APIs return standard response envelopes. Postman/cURL requests succeed with valid tokens and fail with 401/403 otherwise.
- [ ] **Testing Requirements:** API-001 (CRUD testing), AUTH-001 (Multi-tenancy isolation).

## Milestone 2.5: Frontend Integration
- [ ] **Objective:** Replace mock data in the UI with dynamic API data.
- [ ] **Dependencies:** Milestone 2.4.
- [ ] **Deliverables:**
  - Update React components in `src/app/(dashboard)/competitors`.
  - Fetch data via SWR or React Server Components.
- [ ] **Completion Criteria:** UI functions correctly without hardcoded mock arrays.
- [ ] **Testing Requirements:** FE-001 (Frontend loading state and rendering).

## Milestone 2.6: Search, Filtering, Pagination
- [ ] **Objective:** Implement advanced list controls and finalize Phase 2.
- [ ] **Dependencies:** Milestone 2.5.
- [ ] **Deliverables:**
  - Query parameter parsing in Route Handlers.
  - `skip` and `take` implementation in Repositories.
  - Wire frontend pagination, search, and filtering UI.
- [ ] **Completion Criteria:** Frontend accurately controls backend data subset. Production build succeeds.
- [ ] **Testing Requirements:** SRCH-001 (Pagination/Search verification), REG-001 (Regression), BLD-001 (Production Build).
