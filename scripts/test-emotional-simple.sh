#!/bin/bash

# Simple test script for emotional progression using curl
# This will make 5 HTTP requests to test the message endpoint

BASE_URL="http://localhost:3000"
AGENT_ID="cmka4xxci0004ijjp7ougflpp"  # Luna agent ID

# Generate a token for the test user
# First, we'll use the API to get auth

echo "╔════════════════════════════════════════════════╗"
echo "║   EMOTIONAL PROGRESSION SYSTEM TEST (cURL)     ║"
echo "║   Testing message endpoint directly            ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Test messages
declare -a MESSAGES=(
  "Hola! Cómo estás?"
  "Qué tal tu día?"
  "Cuáles son tus hobbies?"
  "Tuve un día muy difícil"
  "Realmente valoro que me escuches"
)

echo "📚 Note: This test requires a valid JWT token"
echo "    You can generate one using: npx tsx -e \"import { generateToken } from '@/lib/jwt'; console.log(await generateToken({userId: 'default-user', email: 'demo@creador-ia.com', name: 'Usuario Demo', plan: 'free'}))\""
echo ""

# Read token from environment or prompt
if [ -z "$JWT_TOKEN" ]; then
  echo "⚠️  JWT_TOKEN not set in environment"
  echo "Usage: JWT_TOKEN='your-token' ./scripts/test-emotional-simple.sh"
  exit 1
fi

echo "✅ Using JWT token from environment"
echo ""

# Make requests
for i in "${!MESSAGES[@]}"; do
  MSG_NUM=$((i + 1))
  MSG="${MESSAGES[$i]}"

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📨 Message $MSG_NUM/5"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "👤 User: \"$MSG\""
  echo ""

  # Make the request
  RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -d "{\"content\": \"$MSG\"}" \
    "$BASE_URL/api/agents/$AGENT_ID/message")

  echo "🤖 Response:"
  echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
  echo ""

  # Wait before next message
  echo "⏳ Waiting 5 seconds before next message..."
  sleep 5
done

echo ""
echo "✅ Test completed!"
