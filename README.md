# Pantry & Plate — MVP

Real-time recipe & nutrition tracking app with multi-device sync (PC + mobile).

**🚀 Live:** https://pantry-plate.vercel.app

## Quick Start

```bash
cd pantry-plate
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── components/
│   ├── Login.jsx       # Auth (signup/login)
│   ├── Profile.jsx     # User profile + macro presets
│   └── Stock.jsx       # Pantry inventory (staple/extra)
├── lib/
│   └── supabaseClient.js  # Supabase client config
├── App.jsx             # Main routing & session management
└── main.jsx            # Entry point
```

## Features (MVP)

- ✅ Email/password authentication (Supabase Auth)
- ✅ User profile with weight/height
- ✅ Macro presets (Standard, Performance, Deficit, Keto, High Protein)
- ✅ Stock management (staple items with qty, extra items with status)
- ✅ Data persistence in Supabase (Postgres)
- ✅ Row Level Security enabled for multi-user isolation

## Env Setup

`.env.local` already contains your Supabase credentials:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Next Steps

1. **Test the app** — create account, add profile, add stock items
2. **Build recipes** — add ingredient table & macro calculations
3. **Deploy** — `npm run build` then push to Vercel

## Stack

- React 18 + Vite
- Supabase (Postgres + Auth + RLS)
- React Router (routing)
- CSS (inline + basic)

## Testing Checklist

- [ ] Register & login works, session persists on refresh
- [ ] Each user sees only their own data (RLS test)
- [ ] Profile edit updates macros
- [ ] Stock: add/delete items
- [ ] Tested on mobile (Safari/Chrome)
