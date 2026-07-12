# Pantry & Plate — Project Context & Development Guide

**Project Owner:** Abel (abelreig@gmail.com)  
**Status:** MVP + Phase 3 (OCR) Complete | Phase 4 (Full UI Redesign) In Progress  
**Last Updated:** 2026-07-12

---

## 👤 Developer Profile

**Role:** Entrepreneur building apps to sell (multiple products planned)  
**Skill Level:** Full-stack capable (React, Node, databases)  
**Preference:** Top-down approach (plan → execute systematically)  
**Communication Style:** Direct, prefers clear options + recommendations  
**Work Method:** Autonomous with periodic check-ins, not hand-holding

---

## 🎯 Business Context

**Goal:** Build Pantry & Plate as first of several sellable SaaS apps  
**Market:** Nutrition/meal planning (initially solo app, then multi-app platform)  
**Approach:** MVP → Production-ready → Sell  

**Critical Decision:** Adopted **Tailwind + shadcn/ui** specifically because:
- Scalable to multiple apps (reusable design system)
- Professional-grade components out of box
- Fast iteration (hours not weeks)
- Buildable to enterprise level later

---

## 🏗️ Final Tech Stack (Locked)

| Layer | Tech | Why |
|-------|------|-----|
| Frontend | React 18 + Vite | Fast, modern, PWA-ready |
| Styling | **Tailwind CSS** + Custom Palette | Scalable design system |
| Components | shadcn/ui (planned next) | Professional UI consistency |
| Backend | Vercel Functions | Serverless, secure API keys |
| Database | Supabase (Postgres + Auth + RLS) | Real-time sync, multi-device |
| Hosting | Vercel | Auto-deploy from GitHub, free tier works |
| Vision AI | Claude Vision API | Receipt OCR analysis |

**Design Palette (Locked):**
- 🟢 Olive: `#6B8E23` (primary)
- 🟡 Mustard: `#DAA520` (accents)
- 🔴 Tomato: `#DC143C` (alerts)
- Typography: Barlow Condensed (headings), Work Sans (body), JetBrains Mono (data)

---

## ✅ Completed Features (MVP)

### Phase 1: Core MVP
- ✅ **Auth:** Email/password signup + login (Supabase)
- ✅ **Profile:** Weight/height + macro presets (Standard/Performance/Deficit/Keto/High Protein)
- ✅ **Stock:** Pantry inventory (staple = qty, extra = status)
- ✅ **Recipes:** Create recipes, add ingredients, auto-calculate macros
- ✅ **Deploy:** Vercel (auto-deploy from GitHub)

### Phase 2: Weekly Planner
- ✅ **Calendar:** Mon-Sun drag & drop interface
- ✅ **Meal Planning:** Assign recipes to days
- ✅ **Macro Tracking:** Daily macros vs target
- ✅ **Navigation:** Week navigation (prev/next)
- ✅ **Persistence:** All saved in Supabase

### Phase 3: Receipt OCR (Functional)
- ✅ **Upload:** Photo of receipt
- ✅ **AI Analysis:** Claude Vision extracts items
- ✅ **Review:** User edits before saving
- ✅ **Stock Integration:** Adds items directly to pantry
- ⚠️ **Status:** Works end-to-end (fixed model name issue)

### Phase 4: UI Redesign (✅ COMPLETE)
- ✅ Tailwind configured with custom palette
- ✅ App.jsx refactored (navbar + layout)
- ✅ Login.jsx refactored (beautiful card design)
- ✅ Profile.jsx refactored (nutrition label aesthetic)
- ✅ Stock.jsx refactored (two-column layout)
- ✅ Recipes.jsx refactored (Tailwind + macro grid)
- ✅ WeeklyPlanner.jsx refactored (drag-drop calendar)
- ✅ ReceiptOCR.jsx refactored (three-step flow)

---

## 📋 Known Issues & Fixes Applied

| Issue | Status | Solution |
|-------|--------|----------|
| React Router useNavigate outside BrowserRouter | ✅ Fixed | Moved BrowserRouter to wrap entire App |
| VERSION reference error | ✅ Fixed | Moved to global scope (top of App.jsx) |
| Tailwind not compiling | ✅ Fixed | Created tailwind.config.js + postcss.config.js manually |
| Claude Vision model not found | ✅ Fixed | Changed model to `claude-opus-4-1-20250805` |
| API key exposure (security) | ✅ Mitigated | API key only on Vercel backend (Vercel Functions) |

---

## 🔐 Security Decisions

**API Key Strategy:**
- **Anthropic API Key:** Stored ONLY in Vercel environment variables (server-side)
- **Method:** Vercel Function (`/api/analyze-receipt.js`) handles Claude calls
- **Never exposed:** Not in `.env.local`, not in GitHub, not in browser
- **Regeneration:** User generated key without expiration (secure under Vercel's encryption)

**Supabase:**
- **Anon Key:** Safe to expose (public); protected by Row Level Security
- **Secret Key:** Never shared; only exists in Supabase dashboard

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Components | 7 (Login, Profile, Stock, Recipes, WeeklyPlanner, ReceiptOCR, App) |
| Database Tables | 6 (users, profiles, stock_items, recipes, recipe_ingredients, meal_plans, scanned_receipts) |
| Vercel Functions | 1 (`/api/analyze-receipt`) |
| Google Fonts | 3 (Barlow Condensed, Work Sans, JetBrains Mono) |
| Commits | ~20 (full Git history in GitHub) |
| Live URL | https://pantry-plate.vercel.app |
| GitHub Repo | https://github.com/Renewabel/pantry-plate |

---

## 🎯 Next Steps (Prioritized)

1. **Phase 4: UI Redesign** (✅ COMPLETE — 2026-07-12)
   - ✅ All 7 components refactored with Tailwind
   - ✅ Custom olive/mustard/tomato palette applied
   - ✅ Google Fonts typography integrated
   - Next: Test on Vercel (desktop + mobile)

2. **Phase 4b: Launch & Testing**
   - [ ] Verify all components render on Vercel
   - [ ] Test on mobile device (responsive)
   - [ ] Verify drag-drop works in WeeklyPlanner
   - [ ] Test receipt upload end-to-end
   - [ ] Gather initial user feedback

2. **Phase 4: AI Menu Generator** (future)
   - Input: User's macros + available stock + preferences
   - Output: Weekly menu suggestions
   - Model: Claude + retrieval from recipes DB

3. **Phase 5: Visual Polish** (post-launch)
   - Replace placeholder emojis with icons
   - Animation transitions
   - Dark mode support
   - Accessibility (a11y) audit

4. **Pre-Launch Checklist**
   - [ ] Test all features end-to-end (desktop + mobile real device)
   - [ ] Security audit (API keys, RLS)
   - [ ] Performance (Lighthouse score)
   - [ ] Analytics setup (optional)
   - [ ] Prepare launch copy (landing page, app description)

---

## 💡 Key Learnings & Decisions

**Why Tailwind (not CSS-in-JS)?**
- Reusable across multiple apps (design system consistency)
- Faster than hand-writing CSS
- Doesn't require learning another abstraction
- Industry standard for startups building products to scale

**Why Vercel Functions (not direct API key)?**
- API key never exposed in browser
- User's key can't be intercepted
- Can add rate limiting/analytics later
- Follows security best practices

**Why Supabase (not Firebase)?**
- SQL (flexible queries vs NoSQL constraints)
- Postgres ecosystem maturity
- Better for data-heavy apps (recipes + macros + tracking)
- RLS is simpler than Firebase security rules

**Why OCR with Claude Vision (not Tesseract)?**
- Claude understands context (knows "pizza" ≠ "ppizza")
- Extracts quantity + price intelligently
- No training needed
- Tolerates bad lighting/angles

---

## 👨‍💻 Collaboration Notes for Future Sessions

**How I work:**
- Top-down planning before implementation
- Systematic execution (don't skip steps)
- Test on real device before considering done
- Keep technical debt low (MVP discipline)

**Code style (if other devs join):**
- Tailwind classes only (no custom CSS unless absolutely necessary)
- Functional components (no class components)
- Clear file structure (components/, lib/, api/)
- Comments only when "why" is non-obvious

**Deployment workflow:**
- Push to GitHub → Vercel auto-deploys → Check live URL
- Never force-push main
- Each feature = one PR + one commit

---

## 📚 Resources

**Project Files:**
- `.env.local` — Supabase credentials (git-ignored, never share)
- `tailwind.config.js` — Color palette + typography config
- `api/analyze-receipt.js` — Claude Vision backend
- `SETUP_SUPABASE.md` — SQL initialization guide

**External:**
- **Live App:** https://pantry-plate.vercel.app
- **GitHub:** https://github.com/Renewabel/pantry-plate
- **Supabase Dashboard:** https://app.supabase.com (project: pantry-plate)
- **Vercel Dashboard:** https://vercel.com/projects/pantry-plate

---

**Last Session Summary:** 
- Phase 4 UI Redesign COMPLETE (all 7 components refactored with Tailwind)
- Fixed Tailwind v4 compilation: installed @tailwindcss/postcss, updated PostCSS config
- All components now use consistent olive/mustard/tomato palette + Google Fonts typography
- Live on Vercel at https://pantry-plate.vercel.app with full Tailwind styling applied
- Next: Real user testing to verify all features work end-to-end
