---
description: Quickly create a complete REST API endpoint with validation, auth, tests
---

# Quick API Workflow

Rapidly create a production-quality REST API endpoint in minutes.
Includes validation, authentication, error handling, and tests.

## Steps

1. **Confirm the resource with the user**
   Ask:
   - Resource name? (e.g., "posts", "products", "orders")
   - What fields/properties?
   - Which operations? (CRUD: Create/Read/Update/Delete)
   - Auth required? (public / authenticated / admin-only)
   - Any special business rules?

2. **Create database model**
   Add to `prisma/schema.prisma`:
   ```prisma
   model Post {
     id        String   @id @default(cuid())
     title     String
     content   String
     status    String   @default("DRAFT")
     authorId  String
     author    User     @relation(fields: [authorId], references: [id])
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     @@index([authorId])
     @@index([status])
   }
   ```

// turbo
3. **Run migration**
   ```bash
   npx prisma migrate dev --name add-<resource>
   ```

4. **Create validation schema**
   ```javascript
   // src/schemas/<resource>.schema.js
   import { z } from 'zod';

   export const createSchema = z.object({ ... });
   export const updateSchema = createSchema.partial();
   export const querySchema = z.object({
     page: z.coerce.number().int().min(1).default(1),
     limit: z.coerce.number().int().min(1).max(100).default(20),
     sort: z.string().optional(),
     q: z.string().max(100).optional(),
   });
   ```

5. **Create service layer**
   ```javascript
   // src/services/<resource>.service.js
   // Functions: list, getById, create, update, delete
   // Include: pagination, filtering, error handling
   ```

6. **Create route handler**
   ```javascript
   // src/routes/<resource>.routes.js
   // Endpoints: GET /, GET /:id, POST /, PATCH /:id, DELETE /:id
   // Include: auth middleware, validation middleware, error handling
   ```

7. **Register routes**
   Add to `src/routes/index.js`:
   ```javascript
   import resourceRoutes from './<resource>.routes.js';
   router.use('/<resources>', resourceRoutes);
   ```

8. **Create integration tests**
   - Test all CRUD operations
   - Test validation errors (invalid input)
   - Test auth (no token, wrong role)
   - Test pagination
   - Test not found (404)

// turbo
9. **Run tests**
   ```bash
   npm test
   ```

10. **Report to user**
    List all endpoints created with example curl commands:
    ```
    GET    /api/v1/<resources>            # List (paginated)
    GET    /api/v1/<resources>/:id        # Get by ID
    POST   /api/v1/<resources>            # Create
    PATCH  /api/v1/<resources>/:id        # Update
    DELETE /api/v1/<resources>/:id        # Delete
    ```
