# API Specification: Backend Phase 2

## Base URL
`/api/v1`

## Global Authentication & Authorization
- **Auth:** All endpoints require a valid JWT Session cookie via NextAuth.
- **AuthZ:** All resources are strictly scoped to the `orgId` embedded in the user's JWT token.

## API Response Standard
Every endpoint strictly adheres to the following response envelope.

**Success Response (2xx):**
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

**Error Response (4xx, 5xx):**
```json
{
  "success": false,
  "data": null,
  "meta": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided.",
    "details": []
  }
}
```

---

## 1. Competitors

### 1.1 List Competitors
- **Route:** `GET /competitors`
- **Description:** Retrieves a paginated list of competitors for the user's organization.
- **Query Parameters:**
  - `page` (optional, default: 1): Page number.
  - `limit` (optional, default: 10): Items per page.
  - `search` (optional): Search query for competitor name or domain.
  - `industry` (optional): Filter by industry.
  - `status` (optional): Filter by status.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "uuid",
        "name": "Synthetix",
        "domain": "synthetix.ai",
        "logoText": "S",
        "logoColor": "bg-blue-100",
        "industry": "Cloud SaaS",
        "status": "Active",
        "score": 85,
        "createdAt": "2023-10-24T12:00:00Z"
      }
    ],
    "meta": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    },
    "error": null
  }
  ```

### 1.2 Get Competitor
- **Route:** `GET /competitors/:id`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "name": "Synthetix",
      "products": [
        {
          "id": "uuid",
          "name": "Analytics",
          "features": []
        }
      ]
    },
    "meta": null,
    "error": null
  }
  ```
- **Error Responses:** `404 Not Found`, `403 Forbidden` (If cross-tenant access attempted)

### 1.3 Create Competitor
- **Route:** `POST /competitors`
- **Request Body:**
  ```json
  {
    "name": "Synthetix",
    "domain": "synthetix.ai",
    "industry": "Cloud SaaS",
    "status": "Active"
  }
  ```
- **Response (201 Created):** `success: true` with the created competitor object in `data`.
- **Error Responses:** `400 Bad Request` (Zod Validation Failure).

### 1.4 Update Competitor
- **Route:** `PUT /competitors/:id`
- **Request Body:** Partial update fields.
- **Response (200 OK):** `success: true` with the updated competitor object in `data`.

### 1.5 Delete Competitor
- **Route:** `DELETE /competitors/:id`
- **Response (200 OK):** `success: true` with `data: { "message": "Deleted successfully" }`.

---

## 2. Products

### 2.1 List Products for Competitor
- **Route:** `GET /competitors/:competitorId/products`
- **Response (200 OK):** `success: true` with an array of product objects in `data`.

### 2.2 Create Product
- **Route:** `POST /competitors/:competitorId/products`
- **Request Body:**
  ```json
  {
    "name": "Analytics Engine",
    "description": "Core data processing tool"
  }
  ```
- **Response (201 Created):** `success: true` with the created product object in `data`.

### 2.3 Update Product
- **Route:** `PUT /products/:id`
- **Response (200 OK):** `success: true` with the updated product object in `data`.

### 2.4 Delete Product
- **Route:** `DELETE /products/:id`
- **Response (200 OK):** `success: true` with success message in `data`.

---

## 3. Features

### 3.1 List Features for Product
- **Route:** `GET /products/:productId/features`
- **Response (200 OK):** `success: true` with an array of feature objects in `data`.

### 3.2 Create Feature
- **Route:** `POST /products/:productId/features`
- **Request Body:**
  ```json
  {
    "name": "Real-time sync",
    "description": "Syncs data in real-time",
    "status": "Available"
  }
  ```
- **Response (201 Created):** `success: true` with the created feature object in `data`.

### 3.3 Update Feature
- **Route:** `PUT /features/:id`
- **Response (200 OK):** `success: true` with the updated feature object in `data`.

### 3.4 Delete Feature
- **Route:** `DELETE /features/:id`
- **Response (200 OK):** `success: true` with success message in `data`.
