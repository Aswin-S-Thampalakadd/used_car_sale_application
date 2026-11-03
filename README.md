# VandiMart — Used Car Marketplace

A full-stack used car sale platform built with **React**, **Node.js / Express**, **PostgreSQL**, and **Redis**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup — Manual](#local-setup--manual)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Start PostgreSQL and Redis](#2-start-postgresql-and-redis)
  - [3. Backend setup](#3-backend-setup)
  - [4. Frontend setup](#4-frontend-setup)
- [Local Setup — Docker](#local-setup--docker)
- [Environment Variables](#environment-variables)
  - [Backend](#backend-env)
  - [Frontend](#frontend-env)
- [Running Tests](#running-tests)
  - [Backend unit and integration tests](#backend-unit-and-integration-tests)
  - [Frontend E2E tests (Cypress)](#frontend-e2e-tests-cypress)
  - [Load tests (k6)](#load-tests-k6)
- [Useful Scripts](#useful-scripts)
- [API Overview](#api-overview)
- [CI/CD](#cicd)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Firebase Auth |
| Backend | Node.js 22, Express 5, ES Modules |
| Database | PostgreSQL 16, Drizzle ORM |
| Cache | Redis 7 |
| Auth | JWT (access + refresh tokens), Google Sign-In via Firebase |
| File uploads | Cloudinary |
| Payments | Razorpay |
| Email | Nodemailer (SMTP) |
| Logging | Winston |
| Containerisation | Docker, Docker Compose |
| CI/CD | GitHub Actions → GHCR → SSH deploy |
| Testing | Jest (unit + integration), Cypress (E2E), k6 (load) |

---

## Project Structure

```
used_car_sale_app/
├── backend/                  # Express API server
│   ├── src/
│   │   ├── config/           # env loader, logger, cloudinary, mailer
│   │   ├── db/               # Drizzle ORM setup and schemas
│   │   ├── middlewares/      # auth, error handler, cache, http logger
│   │   ├── modules/          # Feature modules (auth, cars, dealers, …)
│   │   └── utils/            # AppError, errorMap
│   ├── tests/                # Jest unit and integration tests
│   ├── .env.development      # Dev environment variables (not committed)
│   ├── .env.test             # Test environment variables (not committed)
│   └── .env.production       # Production environment variables (not committed)
│
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── api/              # API client (fetch wrapper)
│   │   ├── components/       # Shared UI components
│   │   ├── context/          # AuthContext
│   │   ├── pages/            # Route-level page components
│   │   └── firebase.js       # Firebase app init
│   ├── cypress/              # Cypress E2E tests
│   └── .env                  # Frontend env variables
│
├── k6/                       # k6 load test scenarios
├── docker-compose.production.yml
└── .github/workflows/        # CI and CD pipelines
```

---

## Prerequisites

Make sure the following are installed on your machine before starting:

- **Node.js 22+** — https://nodejs.org
- **npm 10+** (comes with Node)
- **PostgreSQL 16** — https://www.postgresql.org/download
- **Redis 7** — https://redis.io/docs/getting-started/installation
- **Git**

Optional (only needed for Docker setup):
- **Docker** — https://docs.docker.com/get-docker
- **Docker Compose** (v2 plugin)

---

## Local Setup — Manual

### 1. Clone the repository

```bash
git clone https://github.com/aswin-s-thampalakadd/used_car_sale_application.git
cd used_car_sale_application
```

### 2. Start PostgreSQL and Redis

If you installed them natively:

```bash
# PostgreSQL (Ubuntu/Debian)
sudo service postgresql start

# Redis
sudo service redis-server start
```

Then create the database:

```bash
psql -U postgres -c "CREATE DATABASE wheelzloop;"
```

### 3. Backend setup

```bash
cd backend
```

**a. Install dependencies**

```bash
npm install
```

**b. Create your development env file**

Copy the template and fill in your values:

```bash
cp .env.development .env.development.local
```

At minimum, update `DATABASE_URL` to point at your local PostgreSQL instance. See the [Backend env section](#backend-env) below for all available variables.

**c. Run database migrations**

```bash
npm run db:migrate
```

This creates all tables using Drizzle Kit.

**d. (Optional) Seed sample data**

```bash
npm run seed
```

**e. Start the development server**

```bash
npm run dev
```

The API will be available at **http://localhost:5000**. Confirm it is running:

```bash
curl http://localhost:5000/health
# {"status":"ok","timestamp":"..."}
```

### 4. Frontend setup

Open a second terminal:

```bash
cd frontend
```

**a. Install dependencies**

```bash
npm install
```

**b. Create your frontend env file**

The root `.env` already contains the defaults for local development. If you need to override anything, create a `.env.development` file:

```bash
# frontend/.env.development
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_RAZORPAY_KEY_ID=rzp_test_your_key_id

# Firebase (required for Google Sign-In)
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

**c. Start the development server**

```bash
npm start
```

The app will open at **http://localhost:3000**.

---

## Local Setup — Docker

The quickest way to get everything running with a single command:

```bash
cd backend
docker compose -f docker-compose.local.yml up --build
```

This starts:
- **Backend** on port `5000`
- **PostgreSQL 16** on port `5434`
- **Redis 7** on port `6380`

The backend container runs migrations automatically on startup. You still need to start the frontend manually (see [step 4](#4-frontend-setup) above).

To stop and remove containers:

```bash
docker compose -f docker-compose.local.yml down
```

To also remove the database volume (full reset):

```bash
docker compose -f docker-compose.local.yml down -v
```

---

## Environment Variables

### Backend env

Create `backend/.env.development` (for local) or `backend/.env.production` (for production). The file is loaded automatically by the central env loader at `src/config/env.js`.

| Variable | Required | Description | Example |
|---|---|---|---|
| `NODE_ENV` | yes | Environment name | `development` |
| `PORT` | no | HTTP port (default `5000`) | `5000` |
| `DATABASE_URL` | yes | PostgreSQL connection string | `postgres://user:pass@localhost:5432/wheelzloop` |
| `REDIS_URL` | no | Redis URL (leave blank to disable caching) | `redis://localhost:6379` |
| `JWT_ACCESS_SECRET` | yes | Secret for signing access tokens | `openssl rand -base64 48` |
| `JWT_REFRESH_SECRET` | yes | Secret for signing refresh tokens | `openssl rand -base64 48` |
| `JWT_ACCESS_EXPIRES_IN` | no | Access token TTL (default `15m`) | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | no | Refresh token TTL (default `30d`) | `30d` |
| `CLOUDINARY_CLOUD_NAME` | yes | Cloudinary cloud name | `yourcloud` |
| `CLOUDINARY_API_KEY` | yes | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | yes | Cloudinary API secret | `abc123...` |
| `RAZORPAY_KEY_ID` | yes | Razorpay key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | yes | Razorpay key secret | `abc123...` |
| `SMTP_HOST` | yes | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | no | SMTP port (default `587`) | `587` |
| `SMTP_USER` | yes | SMTP login email | `you@gmail.com` |
| `SMTP_PASS` | yes | SMTP password / app password | `xxxx xxxx xxxx xxxx` |
| `APP_URL` | yes | Public URL of the frontend | `http://localhost:3000` |
| `CORS_ORIGINS` | yes | Allowed CORS origins (comma-separated) | `http://localhost:3000` |
| `LOG_LEVEL` | no | Winston log level (default `debug` in dev) | `debug` |
| `DB_POOL_MAX` | no | Max DB pool connections (default `20`) | `10` |
| `DB_POOL_MIN` | no | Min DB pool connections (default `2`) | `2` |

> **Tip** — generate strong secrets with:
> ```bash
> openssl rand -base64 48
> ```

### Frontend env

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_API_URL` | yes | Backend API base URL |
| `REACT_APP_RAZORPAY_KEY_ID` | yes | Razorpay publishable key |
| `REACT_APP_FIREBASE_API_KEY` | yes (Google Sign-In) | Firebase web API key |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | yes (Google Sign-In) | Firebase auth domain |
| `REACT_APP_FIREBASE_PROJECT_ID` | yes (Google Sign-In) | Firebase project ID |
| `REACT_APP_FIREBASE_APP_ID` | yes (Google Sign-In) | Firebase app ID |

---

## Running Tests

### Backend unit and integration tests

The test suite uses **Jest** with ES Module support. Tests run against a separate `wheelzloop_test` database — no real DB connection is needed for unit tests (all repositories are mocked).

```bash
cd backend

# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# With coverage report
npm run test:coverage
```

For integration tests a real PostgreSQL instance is expected at the `DATABASE_URL` in `backend/.env.test`.

### Frontend E2E tests (Cypress)

Make sure both the backend and frontend dev servers are running first, then:

```bash
cd frontend

# Headless (CI-friendly, prints results to terminal)
npx cypress run --browser electron

# Run a single spec file
npx cypress run --browser electron --spec "cypress/e2e/06-car-details.cy.js"

# Interactive UI (requires a display)
npx cypress open
```

All API calls are intercepted with `cy.intercept()` — the tests do not require a live database.

### Load tests (k6)

Make sure the backend is running at `http://localhost:5000`, then from the project root:

```bash
# Smoke test (1 VU, 30 seconds — good sanity check)
SCENARIO=smoke ./k6/run-all.sh

# Public endpoints load test (ramps to 100 VUs)
SCENARIO=public ./k6/run-all.sh

# Full suite (smoke → public → auth → cars → authenticated → stress)
./k6/run-all.sh
```

Before running authenticated scenarios, create the load test users:

```bash
cd backend
npm run seed:loadtest
```

Results are saved to `k6/results/<timestamp>/`.

---

## Useful Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm start` | Start production server |
| `npm run db:migrate` | Run pending database migrations (dev) |
| `npm run db:migrate:prod` | Run migrations against production DB |
| `npm run db:generate` | Generate new migration from schema changes |
| `npm run seed` | Seed sample data |
| `npm run seed:loadtest` | Create k6 load test users |
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests |
| `npm run test:integration` | Run integration tests |
| `npm run test:coverage` | Run tests and generate coverage report |

### Frontend

| Command | Description |
|---|---|
| `npm start` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npx cypress run --browser electron` | Run E2E tests headlessly |
| `npx cypress open` | Open Cypress interactive UI |

---

## API Overview

All REST endpoints are mounted under `/api/v1/`. The server also exposes a health check at `/health`.

| Prefix | Description |
|---|---|
| `/api/v1/auth` | Customer / dealer / admin login, signup, token refresh, logout |
| `/api/v1/cars` | Car listings — browse, search, filter, CRUD |
| `/api/v1/dealers` | Dealer profiles and their listings |
| `/api/v1/enquiries` | Customer enquiries to dealers |
| `/api/v1/favourites` | Saved / favourite cars |
| `/api/v1/reviews` | Car and app reviews |
| `/api/v1/users` | User profile management |
| `/api/v1/subscriptions` | Dealer subscription plans and Razorpay payment flow |
| `/api/v1/notifications` | In-app notifications |
| `/api/v1/newsletter` | Newsletter subscribe / confirm / unsubscribe |
| `/api/v1/uploads` | Image upload to Cloudinary |
| `/api/v1/stats` | Public platform statistics |
| `/api/v1/admin` | Admin panel endpoints |

Authentication uses **Bearer JWT tokens** in the `Authorization` header.

---

## CI/CD

GitHub Actions runs two workflows:

**CI** (on every push and PR to `master`, `develop`, `staging`):
1. Lint backend and frontend
2. Run backend unit and integration tests
3. Docker build check for both images

**CD** (on push to `master` only):
1. Build and push Docker images to **GitHub Container Registry (GHCR)**
2. SSH into the production server
3. Pull latest images and restart containers with `docker compose up -d --wait`
4. Run a health check smoke test

See [`.github/workflows/SECRETS.md`](.github/workflows/SECRETS.md) for the full list of required GitHub secrets and instructions for preparing the production server.
