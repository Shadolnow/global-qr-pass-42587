# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/063ed9e9-3c06-48ed-bf72-03ac1cc886ac

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/063ed9e9-3c06-48ed-bf72-03ac1cc886ac) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Supabase setup (auth, database, and local dev)

This project uses Supabase for authentication, RBAC, and realtime. To run locally:

1) Create a Supabase project (or use the Supabase CLI for local dev).

2) Copy `.env.example` to `.env` and set these values:

```
VITE_SUPABASE_URL=<your-supabase-project-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
# Optional for admin/seed scripts run via Node (not used in browser)
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

3) Apply migrations with the Supabase CLI (optional but recommended):

```
# Ensure supabase CLI is installed: https://supabase.com/docs/guides/cli
supabase start           # if you want local Postgres, otherwise skip
supabase migrations up   # apply SQL in supabase/migrations
```

4) Seed the Super Admin (optional, requires service role key):

```
# Set env vars in your shell (Windows PowerShell example)
$env:SUPABASE_URL="<project-url>"
$env:SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
# Optional overrides
$env:SUPERADMIN_EMAIL="shamsud.ahmed@gmail.com"
$env:SUPERADMIN_USERNAME="shamsud"
$env:SUPERADMIN_PASSWORD="Golaghat@890"   # rotate after first login

npm run seed:superadmin
```

This will create (or ensure) the Super Admin user, assign the `admin` role, and upsert the username→email mapping.

5) Development

```
npm i
npm run dev
```

### Username login support

You can sign in using either your email or username. On sign-up, the app stores a mapping in `public.username_email` so future logins with the username resolve to the registered email.

### Security notes

- The `public.username_email` table allows public SELECT specifically to resolve usernames before authentication. Insert/update/delete are restricted to the owner via RLS.
- For production, consider restricting exposure (e.g., via a secure RPC that returns only email for exact matches).


## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/063ed9e9-3c06-48ed-bf72-03ac1cc886ac) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
