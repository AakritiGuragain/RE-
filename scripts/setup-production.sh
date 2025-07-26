#!/bin/bash

# =============================================================================
# ReLoop Production Setup Script
# =============================================================================
# This script helps automate the setup of external services for production
# Run with: bash scripts/setup-production.sh

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    local deps=("curl" "jq" "docker" "docker-compose" "node" "npm")
    local missing_deps=()
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            missing_deps+=("$dep")
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Please install missing dependencies and run again"
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# Create directory structure
create_directories() {
    log_info "Creating directory structure..."
    
    mkdir -p config
    mkdir -p logs
    mkdir -p backups
    mkdir -p uploads
    mkdir -p scripts
    
    log_success "Directory structure created"
}

# Generate secure secrets
generate_secrets() {
    log_info "Generating secure secrets..."
    
    # Generate JWT secrets
    JWT_SECRET=$(openssl rand -base64 32)
    JWT_REFRESH_SECRET=$(openssl rand -base64 32)
    
    # Generate database password
    DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    
    # Generate Redis password
    REDIS_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    
    log_success "Secure secrets generated"
}

# Setup environment files
setup_environment() {
    log_info "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "reloop-backend/.env" ]; then
        cp reloop-backend/.env.example reloop-backend/.env
        
        # Replace placeholders with generated secrets
        sed -i "s/your-super-secret-jwt-key-change-in-production-min-32-chars/$JWT_SECRET/g" reloop-backend/.env
        sed -i "s/your-refresh-secret-different-from-jwt-secret-min-32-chars/$JWT_REFRESH_SECRET/g" reloop-backend/.env
        
        log_success "Backend environment file created"
    else
        log_warning "Backend .env file already exists, skipping..."
    fi
    
    # Frontend environment
    if [ ! -f ".env.production" ]; then
        cp .env.example .env.production
        log_success "Frontend environment file created"
    else
        log_warning "Frontend .env.production file already exists, skipping..."
    fi
}

# Validate environment variables
validate_environment() {
    log_info "Validating environment configuration..."
    
    local required_backend_vars=(
        "DATABASE_URL"
        "REDIS_URL"
        "JWT_SECRET"
        "SENDGRID_API_KEY"
        "GOOGLE_CLOUD_PROJECT_ID"
        "STRIPE_SECRET_KEY"
    )
    
    local missing_vars=()
    
    # Check backend environment
    if [ -f "reloop-backend/.env" ]; then
        source reloop-backend/.env
        
        for var in "${required_backend_vars[@]}"; do
            if [ -z "${!var}" ] || [[ "${!var}" == *"your_"* ]] || [[ "${!var}" == *"change"* ]]; then
                missing_vars+=("$var")
            fi
        done
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_warning "The following environment variables need to be configured:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        log_info "Please update the environment files with real values"
        return 1
    fi
    
    log_success "Environment validation passed"
    return 0
}

# Setup database
setup_database() {
    log_info "Setting up database..."
    
    # Check if we can connect to the database
    if [ -f "reloop-backend/.env" ]; then
        source reloop-backend/.env
        
        if [[ "$DATABASE_URL" != *"your_"* ]]; then
            cd reloop-backend
            
            # Install dependencies if not already installed
            if [ ! -d "node_modules" ]; then
                log_info "Installing backend dependencies..."
                npm install
            fi
            
            # Generate Prisma client
            log_info "Generating Prisma client..."
            npx prisma generate
            
            # Run database migrations
            log_info "Running database migrations..."
            npx prisma migrate deploy
            
            # Seed database (optional)
            read -p "Do you want to seed the database with sample data? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                log_info "Seeding database..."
                npx prisma db seed
            fi
            
            cd ..
            log_success "Database setup completed"
        else
            log_warning "Database URL not configured, skipping database setup"
        fi
    fi
}

# Test external services
test_services() {
    log_info "Testing external service connections..."
    
    if [ -f "reloop-backend/.env" ]; then
        source reloop-backend/.env
        
        # Test database connection
        if [[ "$DATABASE_URL" != *"your_"* ]]; then
            log_info "Testing database connection..."
            cd reloop-backend
            if npx prisma db execute --stdin <<< "SELECT 1;" &> /dev/null; then
                log_success "Database connection successful"
            else
                log_error "Database connection failed"
            fi
            cd ..
        fi
        
        # Test Redis connection
        if [[ "$REDIS_URL" != *"your_"* ]]; then
            log_info "Testing Redis connection..."
            if timeout 5 redis-cli -u "$REDIS_URL" ping &> /dev/null; then
                log_success "Redis connection successful"
            else
                log_warning "Redis connection failed or Redis CLI not available"
            fi
        fi
        
        # Test SendGrid API
        if [[ "$SENDGRID_API_KEY" != *"your_"* ]]; then
            log_info "Testing SendGrid API..."
            response=$(curl -s -o /dev/null -w "%{http_code}" \
                -X GET "https://api.sendgrid.com/v3/user/profile" \
                -H "Authorization: Bearer $SENDGRID_API_KEY")
            
            if [ "$response" = "200" ]; then
                log_success "SendGrid API connection successful"
            else
                log_warning "SendGrid API connection failed (HTTP $response)"
            fi
        fi
        
        # Test Stripe API
        if [[ "$STRIPE_SECRET_KEY" != *"your_"* ]]; then
            log_info "Testing Stripe API..."
            response=$(curl -s -o /dev/null -w "%{http_code}" \
                -X GET "https://api.stripe.com/v1/account" \
                -u "$STRIPE_SECRET_KEY:")
            
            if [ "$response" = "200" ]; then
                log_success "Stripe API connection successful"
            else
                log_warning "Stripe API connection failed (HTTP $response)"
            fi
        fi
    fi
}

# Build and start services
start_services() {
    log_info "Building and starting services..."
    
    # Build Docker images
    log_info "Building Docker images..."
    docker-compose build
    
    # Start services
    log_info "Starting services..."
    docker-compose up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    if curl -f http://localhost:3000/health &> /dev/null; then
        log_success "Backend service is running"
    else
        log_error "Backend service failed to start"
        docker-compose logs backend
        return 1
    fi
    
    if curl -f http://localhost:5173 &> /dev/null; then
        log_success "Frontend service is running"
    else
        log_error "Frontend service failed to start"
        docker-compose logs frontend
        return 1
    fi
    
    log_success "All services are running successfully"
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Create monitoring configuration
    cat > config/monitoring.yml << EOF
version: '3.8'
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./config/prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - reloop-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana-storage:/var/lib/grafana
    networks:
      - reloop-network

volumes:
  grafana-storage:

networks:
  reloop-network:
    external: true
EOF
    
    log_success "Monitoring configuration created"
}

# Create backup script
create_backup_script() {
    log_info "Creating backup script..."
    
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash

# ReLoop Backup Script
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
if [ -f "reloop-backend/.env" ]; then
    source reloop-backend/.env
    
    if [[ "$DATABASE_URL" != *"your_"* ]]; then
        echo "Creating database backup..."
        pg_dump "$DATABASE_URL" > "$BACKUP_DIR/database_$DATE.sql"
        gzip "$BACKUP_DIR/database_$DATE.sql"
        echo "Database backup created: database_$DATE.sql.gz"
    fi
fi

# Backup uploaded files
if [ -d "uploads" ]; then
    echo "Creating files backup..."
    tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" uploads/
    echo "Files backup created: uploads_$DATE.tar.gz"
fi

# Clean old backups (keep last 7 days)
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete

echo "Backup completed successfully"
EOF
    
    chmod +x scripts/backup.sh
    log_success "Backup script created"
}

# Main setup function
main() {
    echo "=================================================="
    echo "        ReLoop Production Setup Script"
    echo "=================================================="
    echo
    
    log_info "Starting production setup..."
    
    # Run setup steps
    check_dependencies
    create_directories
    generate_secrets
    setup_environment
    
    # Prompt user to configure environment variables
    echo
    log_warning "IMPORTANT: Please configure your environment variables before continuing!"
    log_info "Edit the following files with your actual API keys and credentials:"
    echo "  - reloop-backend/.env"
    echo "  - .env.production"
    echo
    log_info "Refer to docs/EXTERNAL_SERVICES_SETUP.md for detailed instructions"
    echo
    
    read -p "Have you configured all environment variables? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if validate_environment; then
            setup_database
            test_services
            start_services
            setup_monitoring
            create_backup_script
            
            echo
            echo "=================================================="
            log_success "Production setup completed successfully!"
            echo "=================================================="
            echo
            log_info "Your ReLoop platform is now running:"
            echo "  - Backend API: http://localhost:3000"
            echo "  - Frontend App: http://localhost:5173"
            echo "  - API Documentation: http://localhost:3000/api/docs"
            echo "  - Monitoring: http://localhost:3001 (admin/admin123)"
            echo
            log_info "Next steps:"
            echo "  1. Configure your domain and SSL certificates"
            echo "  2. Set up production monitoring and alerts"
            echo "  3. Configure automated backups"
            echo "  4. Run load tests to verify performance"
            echo
            log_info "For detailed deployment instructions, see:"
            echo "  - docs/PRODUCTION_DEPLOYMENT.md"
            echo "  - docs/EXTERNAL_SERVICES_SETUP.md"
            echo
        else
            log_error "Environment validation failed. Please configure missing variables and run again."
            exit 1
        fi
    else
        log_info "Please configure your environment variables and run this script again."
        log_info "Use 'bash scripts/setup-production.sh' to restart the setup."
        exit 0
    fi
}

# Run main function
main "$@"
