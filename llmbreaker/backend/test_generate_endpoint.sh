#!/bin/bash
# Test script for /api/generate-next-token endpoint
# Note: Restart the Flask server before running this test

BASE_URL="http://localhost:5000"

echo "=== Testing /api/generate-next-token endpoint ==="
echo ""

# Test 1: Missing session_id (should return 400)
echo "Test 1: Missing session_id (expect 400)"
curl -s -X POST "$BASE_URL/api/generate-next-token" \
  -H "Content-Type: application/json" \
  -d '{"context": "Hello", "temperature": 1.0}' | jq '.'
echo ""

# Test 2: Non-existent session (should return 404)
echo "Test 2: Non-existent session (expect 404)"
curl -s -X POST "$BASE_URL/api/generate-next-token" \
  -H "Content-Type: application/json" \
  -d '{"session_id": "fake-session-123", "context": "Hello", "temperature": 1.0}' | jq '.'
echo ""

# Test 3: Valid request with real session (requires a running training session)
echo "Test 3: Valid request (requires active session with trained model)"
echo "To test this:"
echo "  1. Start a training session via the UI"
echo "  2. Copy the session_id"
echo "  3. Run: curl -X POST $BASE_URL/api/generate-next-token \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"session_id\": \"YOUR_SESSION_ID\", \"context\": \"Hello wor\", \"temperature\": 1.0}'"
echo ""

echo "=== Expected Response Format ==="
echo '{'
echo '  "next_token": "l",'
echo '  "probabilities": ['
echo '    {"token": "l", "prob": 0.42},'
echo '    {"token": "d", "prob": 0.18},'
echo '    ...'
echo '  ],'
echo '  "context_used": "llo wor"'
echo '}'
