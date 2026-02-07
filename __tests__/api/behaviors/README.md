# Behavior API Tests

## Overview
These are integration tests for the Behavior API endpoints. They test actual API routes with a real PostgreSQL test database.

## Test Files (33 tests total)
- `behavior-crud.test.ts` - DELETE and PATCH operations for behaviors
- `get-behaviors.test.ts` - GET endpoint with behavior profiles and statistics
- `intensity-history.test.ts` - Intensity history tracking over time
- `pagination.test.ts` - Cursor-based pagination for trigger logs
- `reset.test.ts` - Behavior reset functionality
- `../analytics/behaviors.test.ts` - Global behavior analytics

## Setup Required

### 1. Test Database
These tests require a PostgreSQL test database. To set it up:

```bash
# The test database is configured in .env.test
# Database URL: postgresql://postgres:{password}@localhost:5432/creador_inteligencias_test

# Create and migrate test database
tsx scripts/setup-test-db.ts

# Or manually:
psql -U postgres -c "CREATE DATABASE creador_inteligencias_test;"
DATABASE_URL="postgresql://postgres:{password}@localhost:5432/creador_inteligencias_test" npx prisma db push
```

### 2. Prisma Client
The Prisma client must include Windows binary targets (already configured in schema.prisma):

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x", "windows"]
}
```

Run `npx prisma generate` after any schema changes.

## Running Tests

```bash
# Run all behavior tests
npx vitest run __tests__/api/behaviors/

# Run with analytics
npx vitest run __tests__/api/behaviors/ __tests__/api/analytics/behaviors.test.ts

# Run specific test file
npx vitest run __tests__/api/behaviors/behavior-crud.test.ts

# Watch mode
npx vitest __tests__/api/behaviors/
```

## How These Tests Work

1. **Database Connection**: Tests use `vi.unmock("@/lib/prisma")` to bypass the global Prisma mock and connect to the real test database

2. **Test Data**: Each test file creates its own test user and agents in `beforeAll()` and cleans up in `afterAll()`

3. **Auth Mocking**: Authentication is mocked to return test users without requiring actual auth tokens

4. **Isolation**: Tests use unique user IDs (e.g., "test-user-crud", "test-user-pagination") to avoid conflicts

## Test Structure

```typescript
describe("Test Suite", () => {
  let testAgentId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Create test user and agents in database
    const testUser = await prisma.user.create({...});
    const testAgent = await prisma.agent.create({...});
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.agent.delete({...});
    await prisma.user.delete({...});
  });

  it("should do something", async () => {
    // Call actual API route
    const response = await GET(req, { params });

    // Assert response
    expect(response.status).toBe(200);
  });
});
```

## Troubleshooting

### "Authentication failed against database server"
- Ensure PostgreSQL is running
- Check credentials in `.env.test`
- Verify test database exists

### "Prisma Client could not locate Query Engine"
- Run `npx prisma generate` to regenerate client with correct binary targets

### Tests finding no data
- Check that auth mock returns the correct user ID that matches test data
- Verify `vi.unmock("@/lib/prisma")` is called before importing prisma

### "Cannot read properties of undefined"
- Ensure all required Prisma models are in the mock (`__tests__/setup.ts`)
- Check that auth-server mock includes `getAuthenticatedUser`

## Configuration Files

- `.env.test` - Test environment variables (DATABASE_URL, etc.)
- `vitest.config.ts` - Loads .env.test and sets test environment
- `__tests__/setup.ts` - Global mocks (bypassed for these tests)
- `prisma/schema.prisma` - Binary targets for cross-platform support
