#!/bin/bash

# Test script for AI Gateway Pro API
# Usage: ./test-api.sh <api-key> [app-url]

if [ -z "$1" ]; then
  echo "Usage: ./test-api.sh <api-key> [app-url]"
  echo "Example: ./test-api.sh sk_abc123def456 https://ai-gateway-pro.vercel.app"
  exit 1
fi

API_KEY="$1"
APP_URL="${2:-http://localhost:3000}"

echo "Testing AI Gateway Pro API"
echo "=========================="
echo "API Key: ${API_KEY:0:10}...${API_KEY: -4}"
echo "App URL: $APP_URL"
echo ""

# Test 1: Make a simple API request
echo "Test 1: POST /api/v1/chat/completions"
echo "--------------------------------------"

RESPONSE=$(curl -s -X POST "$APP_URL/api/v1/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Say hello in one word."}],
    "max_tokens": 10
  }')

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if it was successful
if echo "$RESPONSE" | grep -q '"error"'; then
  echo "Status: FAILED"
  exit 1
elif echo "$RESPONSE" | grep -q '"choices"'; then
  echo "Status: SUCCESS"
  echo ""
  echo "Test 2: Verify usage was recorded"
  echo "--------------------------------"
  echo "Check Supabase aigw_usage table:"
  echo "SELECT * FROM aigw_usage WHERE month_year = '2026-05' ORDER BY updated_at DESC LIMIT 1;"
  exit 0
else
  echo "Status: UNKNOWN RESPONSE"
  exit 1
fi
