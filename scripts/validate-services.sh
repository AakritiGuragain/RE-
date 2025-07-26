#!/bin/bash

# =============================================================================
# ReLoop External Services Validation Script
# =============================================================================
# This script validates all external service configurations
# Run with: bash scripts/validate-services.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Test function wrapper
run_test() {
    local test_name="$1"
    local test_function="$2"
    
    ((TOTAL_TESTS++))
    echo -n "Testing $test_name... "
    
    if $test_function; then
        log_success "$test_name"
        return 0
    else
        log_error "$test_name"
        return 1
    fi
}

# Load environment variables
load_environment() {
    if [ -f "reloop-backend/.env" ]; then
        source reloop-backend/.env
        log_info "Loaded backend environment variables"
    else
        log_error "Backend .env file not found"
        exit 1
    fi
    
    if [ -f ".env.production" ]; then
        source .env.production
        log_info "Loaded frontend environment variables"
    else
        log_warning "Frontend .env.production file not found"
    fi
}

# Test database connection
test_database() {
    if [[ -z "$DATABASE_URL" || "$DATABASE_URL" == *"your_"* ]]; then
        echo "Database URL not configured"
        return 1
    fi
    
    # Test PostgreSQL connection
    if command -v psql &> /dev/null; then
        if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
            return 0
        fi
    fi
    
    # Alternative test using curl for HTTP-based databases
    if [[ "$DATABASE_URL" == *"supabase"* ]]; then
        # Extract host from Supabase URL for basic connectivity test
        local host=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
        if ping -c 1 "$host" &> /dev/null; then
            return 0
        fi
    fi
    
    return 1
}

# Test Redis connection
test_redis() {
    if [[ -z "$REDIS_URL" || "$REDIS_URL" == *"your_"* ]]; then
        echo "Redis URL not configured"
        return 1
    fi
    
    if command -v redis-cli &> /dev/null; then
        if timeout 5 redis-cli -u "$REDIS_URL" ping &> /dev/null; then
            return 0
        fi
    fi
    
    return 1
}

# Test SendGrid API
test_sendgrid() {
    if [[ -z "$SENDGRID_API_KEY" || "$SENDGRID_API_KEY" == *"your_"* ]]; then
        echo "SendGrid API key not configured"
        return 1
    fi
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X GET "https://api.sendgrid.com/v3/user/profile" \
        -H "Authorization: Bearer $SENDGRID_API_KEY")
    
    [ "$response" = "200" ]
}

# Test Stripe API
test_stripe() {
    if [[ -z "$STRIPE_SECRET_KEY" || "$STRIPE_SECRET_KEY" == *"your_"* ]]; then
        echo "Stripe secret key not configured"
        return 1
    fi
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X GET "https://api.stripe.com/v1/account" \
        -u "$STRIPE_SECRET_KEY:")
    
    [ "$response" = "200" ]
}

# Test Khalti API
test_khalti() {
    if [[ -z "$KHALTI_SECRET_KEY" || "$KHALTI_SECRET_KEY" == *"your_"* ]]; then
        echo "Khalti secret key not configured"
        return 1
    fi
    
    # Test Khalti API endpoint
    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X GET "https://khalti.com/api/v2/payment/verify/" \
        -H "Authorization: Key $KHALTI_SECRET_KEY")
    
    # Khalti returns 400 for invalid request, but 401 for invalid key
    [ "$response" != "401" ]
}

# Test Google Cloud Services
test_google_cloud() {
    if [[ -z "$GOOGLE_CLOUD_PROJECT_ID" || "$GOOGLE_CLOUD_PROJECT_ID" == *"your_"* ]]; then
        echo "Google Cloud project ID not configured"
        return 1
    fi
    
    # Test if service account key exists
    if [[ -n "$GOOGLE_CLOUD_KEY_FILE" && -f "$GOOGLE_CLOUD_KEY_FILE" ]]; then
        return 0
    elif [[ -n "$GOOGLE_CLOUD_CREDENTIALS_BASE64" && "$GOOGLE_CLOUD_CREDENTIALS_BASE64" != *"your_"* ]]; then
        return 0
    fi
    
    return 1
}

# Test Google Maps API
test_google_maps() {
    local api_key="$GOOGLE_MAPS_API_KEY"
    if [[ -z "$api_key" ]]; then
        api_key="$VITE_GOOGLE_MAPS_API_KEY"
    fi
    
    if [[ -z "$api_key" || "$api_key" == *"your_"* ]]; then
        echo "Google Maps API key not configured"
        return 1
    fi
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        "https://maps.googleapis.com/maps/api/geocode/json?address=Kathmandu&key=$api_key")
    
    [ "$response" = "200" ]
}

# Test Sparrow SMS API
test_sparrow_sms() {
    if [[ -z "$SPARROW_SMS_TOKEN" || "$SPARROW_SMS_TOKEN" == *"your_"* ]]; then
        echo "Sparrow SMS token not configured"
        return 1
    fi
    
    # Test Sparrow SMS API
    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X GET "https://api.sparrowsms.com/v2/credit" \
        -H "Authorization: Bearer $SPARROW_SMS_TOKEN")
    
    [ "$response" = "200" ]
}

# Test AI Classifier API
test_ai_classifier() {
    if [[ -z "$AI_CLASSIFIER_API_URL" || "$AI_CLASSIFIER_API_URL" == *"your_"* ]]; then
        echo "AI Classifier API URL not configured"
        return 1
    fi
    
    # Basic connectivity test
    local host=$(echo "$AI_CLASSIFIER_API_URL" | sed -n 's|https\?://\([^/]*\).*|\1|p')
    if ping -c 1 "$host" &> /dev/null; then
        return 0
    fi
    
    return 1
}

# Test MQTT Broker
test_mqtt() {
    if [[ -z "$MQTT_BROKER_URL" || "$MQTT_BROKER_URL" == *"your_"* ]]; then
        echo "MQTT broker URL not configured"
        return 1
    fi
    
    # Extract host and port from MQTT URL
    local host_port=$(echo "$MQTT_BROKER_URL" | sed -n 's|.*://\([^/]*\).*|\1|p')
    local host=$(echo "$host_port" | cut -d':' -f1)
    local port=$(echo "$host_port" | cut -d':' -f2)
    
    if [[ -z "$port" ]]; then
        port=1883
    fi
    
    # Test connectivity
    if timeout 5 nc -z "$host" "$port" &> /dev/null; then
        return 0
    fi
    
    return 1
}

# Test Sentry DSN
test_sentry() {
    local dsn="$SENTRY_DSN"
    if [[ -z "$dsn" ]]; then
        dsn="$VITE_SENTRY_DSN"
    fi
    
    if [[ -z "$dsn" || "$dsn" == *"your_"* ]]; then
        echo "Sentry DSN not configured"
        return 1
    fi
    
    # Extract host from Sentry DSN
    local host=$(echo "$dsn" | sed -n 's|.*@\([^/]*\)/.*|\1|p')
    if ping -c 1 "$host" &> /dev/null; then
        return 0
    fi
    
    return 1
}

# Test environment variables completeness
test_environment_completeness() {
    local required_vars=(
        "DATABASE_URL"
        "REDIS_URL"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" || "${!var}" == *"your_"* || "${!var}" == *"change"* ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        return 0
    else
        echo "Missing required variables: ${missing_vars[*]}"
        return 1
    fi
}

# Generate validation report
generate_report() {
    echo
    echo "=================================================="
    echo "           VALIDATION REPORT"
    echo "=================================================="
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $PASSED_TESTS"
    echo "Failed: $FAILED_TESTS"
    echo "Success Rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
    echo "=================================================="
    
    if [ $FAILED_TESTS -eq 0 ]; then
        log_success "All services are properly configured!"
        echo
        log_info "Your ReLoop platform is ready for production deployment."
        return 0
    else
        log_error "$FAILED_TESTS service(s) failed validation"
        echo
        log_info "Please fix the failed services before deploying to production."
        log_info "Refer to docs/EXTERNAL_SERVICES_SETUP.md for configuration help."
        return 1
    fi
}

# Main validation function
main() {
    echo "=================================================="
    echo "     ReLoop External Services Validation"
    echo "=================================================="
    echo
    
    log_info "Starting service validation..."
    echo
    
    # Load environment variables
    load_environment
    echo
    
    # Run all tests
    run_test "Environment Completeness" test_environment_completeness
    run_test "Database Connection" test_database
    run_test "Redis Connection" test_redis
    run_test "SendGrid API" test_sendgrid
    run_test "Stripe API" test_stripe
    run_test "Khalti API" test_khalti
    run_test "Google Cloud Services" test_google_cloud
    run_test "Google Maps API" test_google_maps
    run_test "Sparrow SMS API" test_sparrow_sms
    run_test "AI Classifier API" test_ai_classifier
    run_test "MQTT Broker" test_mqtt
    run_test "Sentry Error Tracking" test_sentry
    
    # Generate final report
    generate_report
}

# Run main function
main "$@"
