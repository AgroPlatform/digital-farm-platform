#!/bin/bash

# Test script for 2FA implementation
# Usage: ./test-2fa.sh

API_URL="http://localhost:8000/api"
EMAIL="test2fa@example.com"
PASSWORD="TestPass123!"

echo "=== Digital Farm Platform 2FA Test Script ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register user
echo -e "${YELLOW}[1/7]${NC} Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"full_name\": \"2FA Test User\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "$EMAIL"; then
  echo -e "${GREEN}✓ Registration successful${NC}"
else
  echo -e "${RED}✗ Registration failed${NC}"
  echo "$REGISTER_RESPONSE"
  exit 1
fi

# Test 2: Login without 2FA
echo -e "\n${YELLOW}[2/7]${NC} Testing normal login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" \
  -c /tmp/cookies.txt)

if echo "$LOGIN_RESPONSE" | grep -q '"requires_totp":false'; then
  echo -e "${GREEN}✓ Login successful without 2FA${NC}"
  ACCESS_TOKEN=$(curl -s -b /tmp/cookies.txt -H "" | grep -o 'access_token=[^;]*' | cut -d= -f2)
else
  echo -e "${RED}✗ Login failed${NC}"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

# Test 3: Setup 2FA
echo -e "\n${YELLOW}[3/7]${NC} Setting up 2FA..."
SETUP_RESPONSE=$(curl -s -X POST "$API_URL/totp/setup" \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d "{\"password\": \"$PASSWORD\"}")

if echo "$SETUP_RESPONSE" | grep -q '"qr_code"'; then
  echo -e "${GREEN}✓ 2FA setup initiated${NC}"
  TOTP_SECRET=$(echo "$SETUP_RESPONSE" | grep -o '"secret":"[^"]*"' | cut -d'"' -f4)
  echo "  Secret: $TOTP_SECRET"
else
  echo -e "${RED}✗ 2FA setup failed${NC}"
  echo "$SETUP_RESPONSE"
  exit 1
fi

# Test 4: Generate TOTP code
echo -e "\n${YELLOW}[4/7]${NC} Generating TOTP code..."
TOTP_CODE=$(python3 -c "import pyotp; print(pyotp.TOTP('$TOTP_SECRET').now())")
if [ -n "$TOTP_CODE" ]; then
  echo -e "${GREEN}✓ TOTP code generated: $TOTP_CODE${NC}"
else
  echo -e "${RED}✗ Failed to generate TOTP code${NC}"
  exit 1
fi

# Test 5: Verify 2FA
echo -e "\n${YELLOW}[5/7]${NC} Verifying TOTP code..."
VERIFY_RESPONSE=$(curl -s -X POST "$API_URL/totp/verify-with-secret" \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt \
  -d "{
    \"password\": \"$PASSWORD\",
    \"secret\": \"$TOTP_SECRET\",
    \"token\": \"$TOTP_CODE\"
  }")

if echo "$VERIFY_RESPONSE" | grep -q '"message"'; then
  echo -e "${GREEN}✓ 2FA enabled successfully${NC}"
else
  echo -e "${RED}✗ 2FA verification failed${NC}"
  echo "$VERIFY_RESPONSE"
  exit 1
fi

# Test 6: Check 2FA status
echo -e "\n${YELLOW}[6/7]${NC} Checking 2FA status..."
STATUS_RESPONSE=$(curl -s -X GET "$API_URL/totp/status" \
  -H "Content-Type: application/json" \
  -b /tmp/cookies.txt)

if echo "$STATUS_RESPONSE" | grep -q '"two_factor_enabled":true'; then
  echo -e "${GREEN}✓ 2FA status confirmed enabled${NC}"
else
  echo -e "${RED}✗ Failed to confirm 2FA status${NC}"
  echo "$STATUS_RESPONSE"
  exit 1
fi

# Test 7: Login with 2FA
echo -e "\n${YELLOW}[7/7]${NC} Testing login with 2FA..."
rm /tmp/cookies.txt

LOGIN_2FA_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }" \
  -c /tmp/cookies.txt)

if echo "$LOGIN_2FA_RESPONSE" | grep -q '"requires_totp":true'; then
  echo -e "${GREEN}✓ Login with 2FA challenge issued${NC}"
  
  # Generate new code
  TOTP_CODE=$(python3 -c "import pyotp; print(pyotp.TOTP('$TOTP_SECRET').now())")
  
  # Verify TOTP
  VERIFY_LOGIN=$(curl -s -X POST "$API_URL/auth/verify-totp" \
    -H "Content-Type: application/json" \
    -b /tmp/cookies.txt \
    -d "{\"token\": \"$TOTP_CODE\"}")
  
  if echo "$VERIFY_LOGIN" | grep -q '"requires_totp":false'; then
    echo -e "${GREEN}✓ 2FA login successful${NC}"
  else
    echo -e "${RED}✗ TOTP verification during login failed${NC}"
    echo "$VERIFY_LOGIN"
    exit 1
  fi
else
  echo -e "${RED}✗ Login with 2FA challenge failed${NC}"
  echo "$LOGIN_2FA_RESPONSE"
  exit 1
fi

echo -e "\n${GREEN}=== All 2FA tests passed! ===${NC}\n"
