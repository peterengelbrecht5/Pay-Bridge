# PayGate - Payment Infrastructure Platform

## Overview

PayGate is a payment infrastructure platform that allows merchants to accept payments through a simple API. The application provides a merchant dashboard for managing API keys, viewing transactions, and accessing developer documentation. It includes a public checkout flow for processing payments and uses Replit Auth for user authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Charts**: Recharts for dashboard visualizations
- **Animations**: Framer Motion for smooth transitions
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints with Zod schema validation
- **Authentication**: Replit OpenID Connect (OIDC) with Passport.js
- **Session Management**: express-session with PostgreSQL store (connect-pg-simple)

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Managed via `drizzle-kit push` command

### Key Data Models
- **Users**: Authentication records from Replit Auth
- **Sessions**: Session storage for authenticated users
- **Merchants**: Business profiles linked to users
- **API Keys**: Hashed keys for API authentication (prefix stored for display)
- **Transactions**: Payment records with status tracking

### API Contract
- Centralized route definitions in `shared/routes.ts`
- Type-safe request/response schemas using Zod
- Shared between frontend and backend for consistency

### Authentication Flow
1. User authenticates via Replit Auth (OIDC)
2. Session created and stored in PostgreSQL
3. User must create a merchant profile (onboarding) before accessing dashboard
4. API key authentication available for external API calls

### Build System
- Development: Vite dev server with HMR proxied through Express
- Production: Vite builds frontend to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Custom build script at `script/build.ts` bundles specific dependencies for faster cold starts

## External Dependencies

### Database
- PostgreSQL database (connection via `DATABASE_URL` environment variable)
- Required tables: users, sessions, merchants, api_keys, transactions

### Authentication
- Replit Auth (OpenID Connect)
- Environment variables required:
  - `ISSUER_URL` (defaults to https://replit.com/oidc)
  - `REPL_ID` (provided by Replit)
  - `SESSION_SECRET` (for signing sessions)
  - `DATABASE_URL` (for session store)

### Third-Party Libraries
- shadcn/ui components (Radix UI primitives)
- Recharts for data visualization
- Framer Motion for animations
- date-fns for date formatting

### Development Tools
- Replit-specific Vite plugins for error overlay and dev banner
- TypeScript with strict mode enabled
- Path aliases configured: `@/` for client, `@shared/` for shared code