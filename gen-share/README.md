# Generator Share

A community-powered platform for sharing generators during power outages. Built with SvelteKit, Supabase, and Tailwind CSS.

## Overview

Generator Share connects neighbors who have generators with those who need them during emergencies. The platform prioritizes:

- **Safety first** - Prominent CO warnings throughout
- **Privacy by design** - No public addresses, only neighborhoods
- **No payments** - Free peer-to-peer sharing
- **Trust through verification** - Phone verification required to post

## Tech Stack

- **Frontend**: SvelteKit 2 + Svelte 5 + TypeScript
- **Styling**: Tailwind CSS (custom config per spec)
- **Backend**: Supabase (Postgres + Auth + Realtime + RLS)
- **Hosting**: Netlify

## Project Structure

```
gen-share/
├── src/
│   ├── lib/
│   │   ├── components/      # UI components
│   │   │   ├── Button.svelte
│   │   │   ├── Input.svelte
│   │   │   ├── Select.svelte
│   │   │   ├── Checkbox.svelte
│   │   │   ├── Toggle.svelte
│   │   │   ├── Textarea.svelte
│   │   │   ├── RadioGroup.svelte
│   │   │   ├── SafetyBanner.svelte
│   │   │   ├── InfoBanner.svelte
│   │   │   ├── Badge.svelte
│   │   │   ├── Chip.svelte
│   │   │   ├── StatusPill.svelte
│   │   │   ├── EmptyState.svelte
│   │   │   ├── Modal.svelte
│   │   │   ├── PageHeader.svelte
│   │   │   ├── ListingCard.svelte
│   │   │   ├── ConversationCard.svelte
│   │   │   ├── UserCard.svelte
│   │   │   ├── MessageBubble.svelte
│   │   │   └── index.ts
│   │   ├── stores/          # Svelte stores
│   │   │   ├── auth.ts
│   │   │   ├── listings.ts
│   │   │   └── conversations.ts
│   │   ├── types.ts         # TypeScript types
│   │   └── supabase.ts      # Supabase client
│   ├── routes/
│   │   ├── +layout.svelte   # Root layout
│   │   ├── +layout.server.ts
│   │   ├── +page.svelte     # Home
│   │   ├── login/           # Auth
│   │   ├── browse/
│   │   │   ├── offers/      # Browse generators
│   │   │   └── requests/    # Browse requests
│   │   ├── create/
│   │   │   ├── offer/       # Post generator
│   │   │   └── request/     # Post request
│   │   ├── listing/[id]/    # Listing details
│   │   ├── conversation/[id]/ # Messaging
│   │   ├── review/[id]/     # Leave review
│   │   ├── report/          # Report user/listing
│   │   ├── profile/         # User profile
│   │   ├── admin/           # Moderation dashboard
│   │   ├── safety/          # Safety checklist
│   │   ├── terms/           # Terms of use
│   │   └── privacy/         # Privacy policy
│   ├── hooks.server.ts      # Auth middleware
│   ├── app.css              # Global styles
│   ├── app.html             # HTML template
│   └── app.d.ts             # Type declarations
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_realtime.sql
├── static/
│   └── favicon.png
├── .env.example
├── .gitignore
├── netlify.toml
├── package.json
├── postcss.config.js
├── svelte.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Setup

### 1. Clone and Install

```bash
cd gen-share
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_realtime.sql`
3. Enable Phone Auth in Authentication > Providers > Phone
4. Configure SMS provider (Twilio recommended)

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ADMIN_USER_IDS=user-id-1,user-id-2
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Deployment to Netlify

### 1. Connect Repository

1. Push code to GitHub
2. Log into [Netlify](https://netlify.com) and click "Add new site"
3. Select "Import an existing project" and connect your GitHub repo
4. Netlify auto-detects SvelteKit via `netlify.toml`

### 2. Environment Variables

Add these in Netlify Site Settings > Environment Variables:

| Variable | Description |
|----------|-------------|
| `PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `ADMIN_USER_IDS` | Comma-separated admin user IDs |

### 3. Deploy

Netlify deploys automatically on push to main. Build settings are configured in `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "build"
```

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles with verification status |
| `listings` | Generator offers and requests |
| `conversations` | Messaging threads between users |
| `messages` | Individual messages |
| `reviews` | Post-completion reviews |
| `reports` | User/listing reports |
| `blocks` | User blocks |

### RLS Policies

All tables have Row Level Security enabled:

- Users can only see/edit their own data
- Active listings visible to all (except blocked users)
- Messages only visible to conversation participants
- Reports only visible to reporter and admins
- Admins have elevated access via `is_admin()` function

## Features

### User Flow

1. **Browse** - View available generators or requests
2. **Message** - Start conversation about a listing
3. **Confirm** - Agree on pickup/return details with safety checklist
4. **Complete** - Mark lend as done
5. **Review** - Leave positive/negative feedback

### Safety Features

- Persistent CO warning banner
- Safety checklist before confirming
- CO acknowledgement required
- Safety page with emergency contacts

### Trust & Verification

- Phone verification required to post
- Review system (positive/negative)
- Report and block functionality
- Admin moderation dashboard

### Privacy

- No public addresses
- Neighborhood-only display
- Address shared only via explicit action in chat
- Map pins fuzzed 0.5-1 mile (when implemented)

## Design Principles

From the spec:

1. **Utility over aesthetics** - Emergency infrastructure, not a product launch
2. **Accessibility is non-negotiable** - Works for ages 8 to 88
3. **Trust through transparency** - Clear disclaimers, no fine print
4. **Speed over delight** - Fast load, fast comprehension
5. **Calm over urgent** - Steady and reliable feel

### Style Guidelines

- 18px base font (minimum for readability)
- 48px minimum touch targets
- WCAG AA contrast
- No gradients, glassmorphism, or decorative elements
- System font stack
- 8px max border radius

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build
npm run check     # Type checking
```

## License

MIT

## Contributing

This is emergency infrastructure. Keep it simple, accessible, and safe.
