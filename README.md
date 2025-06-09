# Fullstack cloudflare example

This repo contain a fullstack example to build on Cloudflare with the following stack:

## Stack

- **RedwoodSDK**: A React framework to run react 19 with SSR/RSC/ServerFunctions/etc.. on Cloudflare
- **Drizzle ORM**: Lightweight, type-safe SQL ORM with migrations
- **Better-auth**: Simple, flexible authentication library - The example is setup to use OTP
- **Alchemy**: Infrastructure-as-Code without the dead weight
- **Shadcn**: A set of beautifully-designed, accessible components to build your component library
- **Bun**: a fast JavaScript all-in-one toolkit

## Resources

- D1 (as main DB)
- KV (for sessions)
- Website running on workers using RedwoodSDK

All the required resources are configured via Alchmey in alchemy.run.ts

## Credits

- **MJ Meyer**: this example was eavily inspired and borrow alot from his [repo](https://github.com/mj-meyer/rwsdk-better-auth-drizzle), adding little things here and there, mainly Alchemy as IaC.
  - Check /types/env.d.ts to see how our IaC help defining our types (no need to generate types with Wrangler)
  - Check ./alchemy.run.ts to see how the whole infra is defined as code via Alchemy

## Getting Started

### 1 Create your new project:

```shell
git clone https://github.com/nickbalestra/fullstack-cf-example
cd fullstack-cf-example
bun install
```

### 2 Setup your env virables

Create an .env file (look at the provided env.example for reference)

### 3 Run the application locally with all the resources needed like db, ...

```shell
bun dev
```

The application will be available at the URL displayed in your terminal (typically `http://localhost:5173`)

### 4 Deploy to Cloudflare

This will provision all the resources needed like db, ...
The application will be available at the Cloudflare URL displayed in your terminal.

```shell
bun infra:up
```

## Application Routes

This example includes several key routes:

- **/** - The landing page with a link to the protected home page
- **/home** - A protected page that requires authentication (redirects to login if not authenticated)
- **/user/login** - The login page where users can authenticate

## Authentication Flow

This example includes a complete authentication system with:

- OTP for signup and login
- Session management using a seperate KV database
- Protected routes
- Logout functionality

## Database Configuration

### Local Development

The project uses Cloudflare D1 (SQLite) with Drizzle ORM. A local development database will automatically setup when you first run `bun dev` in `./wrangler`

### Database Schema

The authentication schema is defined in `src/db/schema` and includes tables for:

- Users
- Sessions
- Accounts

### Making Schema Changes

When you need to update your database schema:

1. Modify the schema files in `src/db/schema`
2. Generate a new migration: `bun migrate:new --name="your_migration_name"`
3. Apply the migration: `bun migrate:dev`

## Deployment

To deploy the whole application (app, db, ecc) to Cloudflare:

1. Run the infra:up command to spin up and deploy: `bun infra:up`
2. Run the infra:destroy to tear it down `bun infra:destroy`

Everytime you change anything to the infra definition and run `infra:up` your whole infra will be updated, that's it.

## Theme System

I eventually managed to implement a robust dark/light theme system that prevents the hydration errors and FOUCs (Flashes of Unstyled Content) I was originally getting because of the complexity of client-only features within SSR-first frameworks.

### Additions/Changes

Starting from the default recommendation from [shadcn](https://ui.shadcn.com/docs/dark-mode/vite) for adding dark mode to a Vite app, I added:
- **Blocking Theme Script (`public/theme-script.js`)**:
  - Executes synchronously in the `<head>` before any React hydration
  - Reads theme preference from localStorage (`red-cloud-theme` key)
  - Immediately applies the correct theme class (`light`, `dark`) to `<html>`
  - Handles system preference detection via `prefers-color-scheme`
  - Includes error handling with fallback to system theme
- **Separated Theme Hook** (`src/app/hooks/use-theme.tsx`): Separated hook logic from the theme-provider for better tree-shaking
- **Theme Provider** (`src/app/components/navigation/theme-provider.tsx`): Manages theme state with SSR-safe initialization
- **CSS Variables** (`src/app/document/styles.css`): Tailwind v4 with custom properties for light/dark modes
- **Hydration Warning Suppression** (`src/client.tsx`): Suppresses Radix UI ID mismatch warnings to clean up console output (not necessary, but it cleans up the browser console errors)

These additions allowed us to acheive:
- Zero flash theme switching
- System preference detection
- Persistent user choice via localStorage
- Hydration-safe SSR compatibility

## Project Structure

```
├── src/
│   ├── app/               # UI components
│   │   ├── pages/         # Page components
│   │   ├── shared/        # Shared components
│   │   └── document/      # Root document/headers/css
│   ├── db/                # Database configuration
│   │   ├── migrations/    # Database migrations
│   │   ├── schema/        # Drizzle schema definitions
│   │   ├── scripts/       # Database scripts for ie seeding
│   │   └── db.ts          # Database connection
│   ├── lib/               # Application logic
│   │   ├── auth.ts        # Server-side auth configuration
│   │   └── auth-client.ts # Client-side auth configuration
│   ├── types/             # Project wide & system types
│   ├── client.tsx         # Client entry point
│   └── worker.tsx         # Server entry point
├── public/
│   └── theme-script.js    # Blocking theme script for FOUC prevention
├── infra.run.ts           # Alchemy main script for orchestrating infrastructure's resources
└── *.config               # Various configuration files (drizzle, vite, wrangler, typescript)
```
