# AI Gateway Pro

Multi-provider AI API gateway with paywall. One API key, 8 providers, automatic fallback.

## Features

- **Multi-Provider**: Access Bedrock, Gemini, Cerebras, Groq, OpenRouter, GitHub Models, and Ollama
- **Automatic Fallback**: Requests automatically retry on the next provider if one fails
- **Usage Tracking**: Real-time dashboard showing monthly request usage
- **Simple Pricing**: Free (50 req/day) + Pro ($9/mo, 10K req/mo)
- **OpenAI-Compatible**: Drop-in replacement for OpenAI API

## Project Structure

```
ai-gateway-pro/
├── app/
│   ├── api/
│   │   ├── v1/chat/completions/    # Main proxy endpoint
│   │   ├── auth/webhook/           # Clerk user creation webhook
│   │   ├── checkout/               # Stripe checkout session
│   │   ├── keys/generate/          # API key generation
│   │   └── stripe-webhook/         # Stripe subscription events
│   ├── dashboard/                  # User dashboard
│   ├── pricing/                    # Pricing page
│   └── page.tsx                    # Landing page
├── components/
│   └── CheckoutButton.tsx          # Stripe checkout button
└── public/
```

## Database Schema

Three tables are created automatically:

### aigw_users
- `id` (TEXT, PK) - Clerk user ID
- `email` (TEXT, UNIQUE) - User email
- `stripe_customer_id` (TEXT) - Stripe customer ID
- `plan` (TEXT) - 'free' or 'pro'
- `created_at` (TIMESTAMP)

### aigw_api_keys
- `key_id` (UUID, PK) - Unique key identifier
- `user_id` (TEXT, FK) - Reference to aigw_users
- `key_hash` (TEXT, UNIQUE) - SHA256 hash of the key
- `label` (TEXT) - User-friendly label
- `created_at` (TIMESTAMP)
- `revoked_at` (TIMESTAMP, nullable)

### aigw_usage
- `id` (BIGSERIAL, PK)
- `user_id` (TEXT, FK)
- `key_id` (UUID, FK)
- `month_year` (TEXT) - Format: YYYY-MM
- `request_count` (INTEGER)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- UNIQUE(user_id, month_year)

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Clerk Auth (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (already using jqeypwrmsgjsmggdgvgd)
NEXT_PUBLIC_SUPABASE_URL=https://jqeypwrmsgjsmggdgvgd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe (created below)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# Gateway
NEXT_PUBLIC_GATEWAY_URL=http://100.104.48.47:7792

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Stripe Setup

In Stripe Dashboard:

1. Go to Products → Create Product
   - Name: "AI Gateway Pro"
   - Pricing: Recurring, $9 USD per month

2. Copy the Price ID (price_...) to `STRIPE_PRO_PRICE_ID`

3. Go to Webhooks → Add Endpoint
   - URL: `https://your-deployment.vercel.app/api/stripe-webhook`
   - Events: `checkout.session.completed`
   - Copy the Signing Secret to `STRIPE_WEBHOOK_SECRET`

4. Copy API keys:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`

### 3. Clerk Setup

In Clerk Dashboard:

1. Go to Webhooks
2. Create endpoint: `https://your-deployment.vercel.app/api/auth/webhook`
3. Events: `user.created`
4. Copy the Signing Secret to `CLERK_WEBHOOK_SECRET`

### 4. Local Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000

### 5. Deploy to Vercel

```bash
vercel --prod
```

Or manually link in Vercel Dashboard and set environment variables.

## API Usage

### Generate an API Key

1. Sign up at the app
2. Go to Dashboard
3. Click "Generate Key"
4. Copy the key (shown only once!)

### Make Requests

```bash
curl -X POST https://your-app.vercel.app/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

Response is standard OpenAI format:

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hi there!"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 5,
    "total_tokens": 15
  }
}
```

## Rate Limits

- **Free**: 50 requests per day (~1,500/month)
- **Pro**: 10,000 requests per month

When limit is exceeded, API returns 429 (Too Many Requests).

## Architecture

### Request Flow

```
User Request
    ↓
POST /api/v1/chat/completions
    ↓
Validate Bearer token (aigw_api_keys)
    ↓
Check user plan (aigw_users)
    ↓
Check monthly quota (aigw_usage)
    ↓
Forward to Gateway (http://100.104.48.47:7792)
    ↓
Increment usage counter
    ↓
Return response to user
```

### Gateway Connection

The app proxies requests to Jacob's existing AI Gateway at `http://100.104.48.47:7792` (accessible via Tailscale). The gateway handles provider selection and fallback.

### Webhook Flow

**Clerk User Creation** → Insert into aigw_users (plan='free')
**Stripe Checkout Completed** → Update user plan to 'pro'

## Troubleshooting

### "Invalid API key"
- Key may be revoked
- Make sure you're using the full key from generation (not truncated)
- Check that the user is not rate-limited

### "Request limit exceeded"
- User has hit their monthly quota
- Free: 50 req/day, Pro: 10,000 req/month
- Direct users to upgrade via dashboard

### Gateway not responding
- Check that `http://100.104.48.47:7792` is reachable from Vercel
- If on free tier Vercel, may not have Tailscale access
- Ensure gateway is running: `curl http://100.104.48.47:7792/health`

## Future Enhancements

- [ ] API key revocation UI
- [ ] Usage analytics/graphs
- [ ] Email alerts for quota warnings
- [ ] Custom request limits via Stripe metadata
- [ ] Rate limiting per key (not just monthly quota)
- [ ] Detailed provider fallback logs
- [ ] Customer portal for subscription management

## License

MIT
