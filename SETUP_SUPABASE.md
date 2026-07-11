# Supabase Setup Instructions

## Step 1: Create tables

1. Go to your Supabase project: https://app.supabase.com/projects
2. Click on your `pantry-plate` project
3. In the left sidebar, click **SQL Editor**
4. Click **New Query**
5. Copy & paste the content from `supabase_init.sql` (the file in this project root)
6. Click **Run** (or Cmd+Enter)

This will create:
- `recipes` table
- `recipe_ingredients` table  
- Row Level Security policies

## Step 2: Verify in Data Browser

After running the SQL:
1. Go to **Table Editor** (left sidebar)
2. You should see three new tables:
   - `profiles` (should already exist)
   - `stock_items` (should already exist)
   - `recipes` ✅ (newly created)
   - `recipe_ingredients` ✅ (newly created)

## Step 3: Test the app

```bash
# Terminal 1: Keep dev server running
cd pantry-plate
npm run dev

# Terminal 2: Open your browser
open http://localhost:5173
```

## Testing flow:

1. **Sign up** with a test email (e.g., test@example.com)
2. **Add Profile** — weight, height, select a macro preset
3. **Add Stock Items** — add 2-3 items (e.g., "Chicken breast", "Rice")
4. **Create Recipe** — go to Recipes tab:
   - Name: "Chicken & Rice"
   - Add ingredients:
     - Chicken breast: 200g, 165 cal/100g, 31g protein/100g
     - Rice: 100g, 130 cal/100g, 2.7g protein/100g
   - Check the macros calculate correctly

## Troubleshooting

**"Error: relation 'public.recipes' does not exist"**
- The SQL didn't run. Check the SQL Editor for errors and re-run.

**"Permission denied for schema public"**
- You're using the wrong API key (secret instead of anon). Check `.env.local`.

**Data not showing in Recipes tab**
- Refresh the page (`Ctrl+R` or `Cmd+R`)
- Check browser console for errors (F12)

---

Once this is working, you can deploy to Vercel (see README.md for next steps).
