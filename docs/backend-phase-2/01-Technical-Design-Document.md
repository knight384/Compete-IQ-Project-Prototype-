# Technical Design Document: Backend Phase 2 (Core Entities CRUD)

## 1. Phase Objective
The objective of Backend Phase 2 is to establish the core domain entities—Organizations, Competitors, Products, and Features—and their associated CRUD (Create, Read, Update, Delete) operations. This phase will replace static mock data in the frontend with dynamic, database-backed information delivered via RESTful API endpoints.

## 2. Functional Scope
- **Organizations:** Ensure users are strictly scoped to their organization. (Foundation built in Phase 1; extended to cascade to new entities).
- **Competitors:** Full CRUD management of competitors.
- **Products:** Competitor products, linked to specific competitors.
- **Features:** Specific features belonging to products or competitors.
- **Search, Filtering, and Pagination:** Required for list endpoints (e.g., Competitor List).

## 3. Non-functional Requirements
- **Security:** All endpoints must be secured. Multi-tenancy must be enforced via `orgId` filtering on every database query.
- **Performance:** Endpoints should respond within 200ms. Pagination must be implemented for large lists to prevent memory bloat and slow queries.
- **Architecture:** Must adhere to the Next.js Route Handlers (BFF) pattern using a strict feature-based module architecture.

## 4. Out-of-Scope Items
- AI integration, OpenAI, Analytics, Reports, Notifications, Background jobs (Inngest), Email, File uploads, OCR, Vector databases, RAG, Billing, Kubernetes, CI/CD, Docker changes, Multi-tenancy redesign.

## 5. Existing Architecture Review
- **Phase 1 Implementation:** Prisma is configured with a Neon PostgreSQL database. NextAuth handles authentication via JWT, exposing `id`, `orgId`, and `role`. Zod is used for validation and Pino for logging.
- **Current Constraints:** The UI relies heavily on hardcoded inline arrays. The frontend must be updated to fetch data via React Server Components or `useEffect`/SWR without altering the UI design.

## 6. Proposed Architecture: Feature-Based Module Design
We will replace the generic layered folder structure with a scalable, feature-based module architecture.

### 6.1 Folder Structure
```
src/
  backend/
    modules/
      competitors/
        competitor.dto.ts
        competitor.mapper.ts
        competitor.repository.ts
        competitor.service.ts
        competitor.types.ts
      products/
      features/
      organizations/
```

### 6.2 Layer Responsibilities
- **Route Handlers (`app/api/v1/...`):**
  - Authenticate and Authorize requests.
  - Parse incoming requests and query parameters.
  - Validate payloads against DTOs.
  - Call the appropriate Service.
  - Format and return standard HTTP JSON responses.
  - *Rule:* Business logic must NEVER exist inside route handlers.
- **Service Layer (`*.service.ts`):**
  - Validates business rules.
  - Coordinates Repositories.
  - Executes database transactions.
  - Calls Mappers to transform output.
  - Throws Domain Errors (e.g., `NotFoundError`).
- **Repository Layer (`*.repository.ts`):**
  - Contains strictly database access logic (Prisma).
  - *Rule:* NEVER contain business logic, perform authentication, or return HTTP responses.
- **Mapper Layer (`*.mapper.ts`):**
  - Transforms raw Prisma objects into standardized API responses.
  - *Rule:* Prisma models should NEVER be returned directly to clients to prevent leaking sensitive fields (e.g., passwords, internal IDs) and to decouple the API contract from the database schema.
  - **Data Flow:** Repository → Service → Mapper → Route Handler API Response.

## 7. Transaction Strategy
Prisma transactions (`prisma.$transaction`) must be used for all multi-step write operations to ensure atomicity and prevent orphaned records.
- **Examples:** Creating a Competitor along with initial Products and Features in a single request.
- **Rollback Expectations:** If any step within the transaction fails (e.g., a unique constraint violation), the entire transaction rolls back automatically. Services must catch these errors and throw appropriate Domain Errors.

## 8. API Response Standard
Every API route must return a strictly consistent response format.

**Success Response:**
```json
{
  "success": true,
  "data": { ... }, // Or Array []
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  },
  "error": null
}
```
**Error Response:**
```json
{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided.",
    "details": [ ... ]
  }
}
```

## 9. DTO and Validation Strategy
Zod schemas (`*.dto.ts`) will dictate the shape of all inputs. DTOs must be strictly separated by responsibility:
- **Create DTO:** Validates payload for `POST` requests.
- **Update DTO:** Validates partial payload for `PUT/PATCH` requests.
- **Query DTO:** Validates GET request query parameters.
- **Filter DTO:** Specific validation for filtering fields (e.g., `industry`, `status`).
- **Pagination DTO:** Validates `page` and `limit` with sensible defaults.

## 10. Error Handling Strategy
Domain-specific error classes must be used in the Service layer and caught by a global API error wrapper in the Route Handlers.
- `ValidationError` → HTTP 400 Bad Request
- `UnauthorizedError` → HTTP 401 Unauthorized
- `ForbiddenError` → HTTP 403 Forbidden
- `NotFoundError` → HTTP 404 Not Found
- `ConflictError` → HTTP 409 Conflict
- `InternalServerError` → HTTP 500 Internal Server Error

## 11. Logging Strategy
Pino logger will classify logs strictly:
- **INFO:** Successful operations, business events (e.g., "Competitor created").
- **WARN:** Recoverable issues, validation failures, unauthorized access attempts.
- **ERROR:** Unhandled exceptions, database connection failures, transaction rollbacks.

## 12. Seed Strategy
To facilitate local development, a robust seed script will be maintained.
**Recommended Execution Order:**
1. Organizations
2. Admin Users
3. Competitors
4. Products
5. Features

*Purpose:* Development seed data ensures all engineers and UI components have rich, realistic data states to test against, preventing "empty state" UI regressions.

## 13. Audit Trail (Future Consideration)
*Note: This is strictly Future Work and is NOT to be implemented in Phase 2.*
Future phases will introduce:
- `createdBy`, `updatedBy`, `deletedBy` fields on all entities.
- A centralized Audit Log table to track historical changes for compliance and undo capabilities.
