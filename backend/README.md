# Backend - AttendanceHub

## Overview

The backend is powered by Encore, a modern backend framework for TypeScript. Encore enables rapid API development, automatic client generation, and easy deployment.

## Technologies Used

- **Encore**: Backend framework for TypeScript
- **TypeScript**: Type-safe API and business logic
- **SQL**: Database migrations and queries

## Encore Implementation

Encore organizes code into services and endpoints. Each service (e.g., attendance, auth, crm) is defined in its own folder. Endpoints are exported functions that handle API requests.

### Example Endpoint

```ts
// backend/attendance/list_attendance.ts
import { encore } from '../encore.app';

export async function list_attendance() {
  // Implementation
}
```

## Auto-Generated Clients

Encore automatically generates TypeScript clients for the frontend. These are available in `backend/encore.gen/` and imported in the frontend for API calls.

## How to Run

1. **Install dependencies:**

   ```sh
   npm install
   ```

2. **Start the Encore backend locally:**

   ```sh
   encore app run
   ```

3. **Run Encore backend in Docker:**

   You can run the backend in a Docker container for isolated local development. This is useful for matching production environments and managing dependencies.

   Build and run the container, mapping the Encore port (default 4000) to your local machine:

   ```sh
   docker build -t attendancehub-backend .
   docker run -p 4000:4000 attendancehub-backend
   ```

   This will start the Encore backend inside Docker, accessible at `http://localhost:4000`.

## Encore Runtime & Local Development

- **Encore** provides hot-reloading and automatic client generation during development. When you run `encore app run`, any changes to endpoints or services are instantly reflected in the running backend and the generated frontend clients.
- **Local development** is seamless: edit TypeScript files in `attendance/`, `auth/`, etc., and Encore will rebuild and update the API and clients automatically.
- **Docker** is recommended for testing the backend in an environment similar to production, ensuring consistency and easy deployment.

## Project Structure

- `attendance/`, `auth/`, `crm/`, etc. - Service folders
- `encore.app` - Encore app entry point
- `migrations/` - SQL migration scripts
- `encore.gen/` - Auto-generated API clients

## Customization

- Add new endpoints by creating new `.ts` files in the relevant service folder.
- Update database schema via migration scripts in `migrations/`.

---
For Encore documentation, visit [https://encore.dev/docs](https://encore.dev/docs).
