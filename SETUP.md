# AI Gateway Pro — Setup Guide

This document walks through the 4-5 manual steps Jacob needs to complete to get the app fully operational with real API keys and webhooks.

## Current Status

- **GitHub Repo**: https://github.com/cascone26/ai-gateway-pro
- **Live URL**: https://ai-gateway-pro.vercel.app (environment variables needed)
- **Supabase Tables**: Already created in jqeypwrmsgjsmggdgvgd project

## Manual Setup Steps

### Step 1: Clerk Authentication Setup

Clerk is used for user signup/signin.

1. Go to https://dashboard.clerk.com
2. Create a new application (or use existing)
3. In the Clerk dashboard, go to **API Keys** (left sidebar)
4. Copy:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

5. In Vercel dashboard (https://vercel.com/cascone26s-projects/ai-gateway-pro):
   - Go to Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
     CLERK_SECRET_KEY=sk_live_...
     ```

6. Back in Clerk dashboard, go to **Webhooks** (left sidebar)
   - Create a new endpoint:
     - URL: `https://ai-gateway-pro.vercel.app/api/auth/webhook`
     - Events: Check **user.created**
   - Copy the **Signing Secret** (whsec_...)
   - Add to Vercel:
     ```
     CLERK_WEBHOOK_SECRET=whsec_...
     ```

### Step 2: Stripe Subscription Setup

Stripe handles billing.

1. Go to https://dashboard.stripe.com
2. Go to **Products** → **Create Product**
   - Name: "AI Gateway Pro"
   - Pricing model: Recurring
   - Price: $9.00 USD per month
   - Create

3. Copy the **Price ID** (price_...) from the product page
   - Add to Vercel:
     ```
     NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_...
     ```

4. Get API keys from **Developers** → **API Keys**:
   - Copy **Publishable key** (pk_live_...)
   - Copy **Secret key** (sk_live_...)
   - Add to Vercel:
     ```
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
     STRIPE_SECRET_KEY=sk_live_...
     ```

5. Set up webhook for subscription completions:
   - Go to **Developers** → **Webhooks**
   - Create endpoint:
     - URL: `https://ai-gateway-pro.vercel.app/api/stripe-webhook`
     - Events: `checkout.session.completed`
   - Copy **Signing Secret** (whsec_...)
   - Add to Vercel:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_...
     ```

### Step 3: Supabase Configuration

Supabase is used for the database (already migrated).

1. Go to https://app.supabase.com
2. Open project "LessonDraft" (jqeypwrmsgjsmggdgvgd)
3. Go to **Settings** → **API**:
   - Copy **Project URL** and **Anon Key**
   - These are already in .env.example

4. Verify tables were created:
   - Go to **SQL Editor**
   - Run: `SELECT * FROM aigw_users;` (should return 0 rows)
   - Tables are: `aigw_users`, `aigw_api_keys`, `aigw_usage`

5. In Vercel, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://jqeypwrmsgjsmggdgvgd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
   (Copy these from Supabase dashboard under Settings → API)

### Step 4: Gateway Configuration

The gateway is Jacob's local AI Gateway running at http://100.104.48.47:7792 on Tailscale.

In Vercel, add:
```
NEXT_PUBLIC_GATEWAY_URL=http://100.104.48.47:7792
NEXT_PUBLIC_APP_URL=https://ai-gateway-pro.vercel.app
```

### Step 5: Redeploy

After setting all environment variables in Vercel:

1. Go to Vercel dashboard: https://vercel.com/cascone26s-projects/ai-gateway-pro
2. Click **Deployments** → Latest deployment
3. Click **Redeploy**
4. Wait for build to complete

Or redeploy via CLI:
```bash
cd ~/projects/ai-gateway-pro
vercel --prod --yes
```

## Verifying the Setup

### 1. Landing Page Works
- Visit https://ai-gateway-pro.vercel.app
- Should see landing page with Sign Up button
- Clerk should load (no console errors)

### 2. Create Test User
- Click "Sign Up"
- Create test account (any email)
- Verify user appears in Supabase: `SELECT * FROM aigw_users;`

### 3. Generate API Key
- After signup, go to Dashboard
- Click "Generate Key"
- Copy the key (only shown once!)

### 4. Test API Endpoint
```bash
# Replace with real key from dashboard
API_KEY="sk_..."

curl -X POST https://ai-gateway-pro.vercel.app/api/v1/chat/completions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

Expected response: Standard OpenAI format (or error if gateway is unreachable)

### 5. Check Usage Tracking
```sql
SELECT * FROM aigw_usage WHERE user_id = 'user_...' AND month_year = '2026-05';
```

Should show `request_count: 1` after a successful API call.

### 6. Upgrade to Pro
- On Dashboard, click "Upgrade to Pro"
- Should redirect to Stripe Checkout
- Complete payment
- User should be updated to plan='pro' in Supabase

## Architecture Notes

### Request Flow
```
User Request (Bearer token)
  ↓
POST /api/v1/chat/completions
  ↓
Validate token → Lookup aigw_api_keys table
  ↓
Check user plan (free: 1500/mo, pro: 10K/mo)
  ↓
Check monthly quota → aigw_usage table
  ↓
Forward to Gateway (http://100.104.48.47:7792/v1/chat/completions)
  ↓
Increment usage counter
  ↓
Return response
```

### Webhook Flow
```
Clerk: user.created
  ↓
POST /api/auth/webhook
  ↓
Insert into aigw_users (plan='free')

Stripe: checkout.session.completed
  ↓
POST /api/stripe-webhook
  ↓
Update aigw_users SET plan='pro' WHERE id=client_reference_id
```

## Troubleshooting

### "The publishableKey passed to Clerk is invalid"
- Clerk env vars not set in Vercel
- Redeploy after setting them

### "Invalid or revoked API key" when calling /api/v1/chat/completions
- Key not found in aigw_api_keys table
- Make sure you generated a key from the dashboard first

### "Request limit exceeded"
- User has hit their monthly quota
- Free: 50 req/day = ~1,500/month
- Pro: 10,000/month
- Direct users to upgrade or wait until next month

### Gateway returns 502/timeout
- Gateway at http://100.104.48.47:7792 is not reachable
- Check that gateway is running: `curl http://100.104.48.47:7792/health`
- May need Tailscale access or custom Subnet Router on Vercel side

## Future Enhancements

- [ ] Custom usage limits via Stripe metadata
- [ ] Email alerts when quota approaching 80%
- [ ] Rate limiting per API key (not just monthly quota)
- [ ] Admin dashboard (view all users, usage, revenue)
- [ ] Stripe customer portal for subscription management
- [ ] API key revocation UI on dashboard
- [ ] More detailed usage analytics/graphs

## Quick Reference

| Component | Status | Config Required |
|-----------|--------|-----------------|
| Clerk Auth | Live | Yes (Steps 1, 5) |
| Stripe Billing | Live | Yes (Steps 2, 5) |
| Supabase DB | Live (tables created) | Yes (Step 3, 5) |
| Gateway Proxy | Configured | Check gateway running |
| Vercel Deployment | Live | Yes (all steps + 5) |

---

**Total Setup Time**: ~15 minutes

**Go live**: After Step 5, app is fully operational.
