# Production Deployment Guide

This guide provides step-by-step instructions for deploying the ReLoop platform to production with all external services configured.

## 🚀 Quick Start Checklist

- [ ] **Database Setup** - PostgreSQL and Redis configured
- [ ] **Environment Variables** - All production secrets configured
- [ ] **External Services** - API keys and integrations tested
- [ ] **Domain & SSL** - Domain configured with SSL certificates
- [ ] **Monitoring** - Error tracking and performance monitoring setup
- [ ] **Backup Strategy** - Database and file backup configured
- [ ] **CI/CD Pipeline** - Automated deployment setup

## 📋 Pre-Deployment Requirements

### 1. Domain and Hosting
```bash
# Required domains:
# - api.reloop.com (Backend API)
# - app.reloop.com or reloop.com (Frontend)
# - cdn.reloop.com (Static assets - optional)
```

### 2. SSL Certificates
```bash
# Option 1: Let's Encrypt (Free)
sudo certbot --nginx -d api.reloop.com -d reloop.com

# Option 2: Cloudflare (Recommended)
# Configure through Cloudflare dashboard
```

### 3. Server Requirements
```yaml
# Minimum Production Server Specs:
CPU: 2 vCPUs
RAM: 4GB
Storage: 50GB SSD
Bandwidth: 1TB/month
OS: Ubuntu 22.04 LTS
```

## 🗄️ Database Setup

### PostgreSQL (Supabase - Recommended)

1. **Create Supabase Project**
   ```bash
   # 1. Go to https://supabase.com
   # 2. Create new project: "reloop-production"
   # 3. Choose region: Asia Pacific (Singapore) - closest to Nepal
   # 4. Set strong database password
   ```

2. **Configure Database**
   ```sql
   -- Run in Supabase SQL Editor
   -- Enable required extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "postgis";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   ```

3. **Get Connection String**
   ```bash
   # From Supabase Dashboard > Settings > Database
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

### Redis (Upstash - Recommended)

1. **Create Upstash Database**
   ```bash
   # 1. Go to https://upstash.com
   # 2. Create new Redis database
   # 3. Choose region: Asia Pacific
   # 4. Copy connection string
   ```

2. **Configure Redis**
   ```bash
   REDIS_URL=rediss://:[PASSWORD]@[ENDPOINT]:6379
   ```

## ☁️ Cloud Services Setup

### Google Cloud Platform

1. **Create Project**
   ```bash
   # 1. Go to https://console.cloud.google.com
   # 2. Create project: "reloop-production"
   # 3. Enable billing
   ```

2. **Enable APIs**
   ```bash
   gcloud services enable storage-api.googleapis.com
   gcloud services enable translate.googleapis.com
   gcloud services enable vision.googleapis.com
   gcloud services enable maps-backend.googleapis.com
   gcloud services enable places-backend.googleapis.com
   ```

3. **Create Service Account**
   ```bash
   # Create service account
   gcloud iam service-accounts create reloop-backend \
     --display-name="ReLoop Backend Service Account"

   # Grant permissions
   gcloud projects add-iam-policy-binding reloop-production \
     --member="serviceAccount:reloop-backend@reloop-production.iam.gserviceaccount.com" \
     --role="roles/storage.admin"

   # Create and download key
   gcloud iam service-accounts keys create ./config/google-cloud-key.json \
     --iam-account=reloop-backend@reloop-production.iam.gserviceaccount.com
   ```

4. **Create Storage Bucket**
   ```bash
   # Create bucket
   gsutil mb -p reloop-production -c STANDARD -l asia-south1 gs://reloop-uploads-prod

   # Set permissions
   gsutil iam ch allUsers:objectViewer gs://reloop-uploads-prod
   ```

## 💳 Payment Gateway Setup

### Stripe Setup

1. **Create Stripe Account**
   ```bash
   # 1. Go to https://stripe.com
   # 2. Complete business verification
   # 3. Activate live payments
   ```

2. **Configure Webhooks**
   ```bash
   # 1. Dashboard > Developers > Webhooks
   # 2. Add endpoint: https://api.reloop.com/integrations/webhooks/stripe
   # 3. Select events:
   #    - payment_intent.succeeded
   #    - payment_intent.payment_failed
   #    - customer.subscription.created
   #    - customer.subscription.updated
   #    - customer.subscription.deleted
   ```

### Khalti Setup (Nepal)

1. **Create Merchant Account**
   ```bash
   # 1. Go to https://khalti.com
   # 2. Apply for merchant account
   # 3. Complete KYC verification
   # 4. Wait for approval (usually 2-3 business days)
   ```

2. **Integration Testing**
   ```bash
   # Test with sandbox keys first
   # Then switch to live keys after approval
   ```

## 📧 Email Service Setup

### SendGrid Configuration

1. **Create SendGrid Account**
   ```bash
   # 1. Go to https://sendgrid.com
   # 2. Create account
   # 3. Verify email address
   ```

2. **Domain Authentication**
   ```bash
   # 1. Settings > Sender Authentication > Domain Authentication
   # 2. Add your domain: reloop.com
   # 3. Add DNS records to your domain provider
   # 4. Verify domain
   ```

3. **Create API Key**
   ```bash
   # 1. Settings > API Keys
   # 2. Create API Key with "Mail Send" permissions
   # 3. Copy API key securely
   ```

## 📱 SMS Service Setup

### Sparrow SMS (Nepal)

1. **Create Account**
   ```bash
   # 1. Go to https://sparrowsms.com
   # 2. Create account and verify
   # 3. Purchase SMS credits
   ```

2. **Get API Token**
   ```bash
   # 1. Dashboard > API
   # 2. Copy API token
   # 3. Test with sample SMS
   ```

## 🤖 AI Service Setup

### Google Cloud AI Platform

1. **Deploy Waste Classification Model**
   ```bash
   # 1. Train your TensorFlow model
   # 2. Save model to Google Cloud Storage
   # 3. Deploy to AI Platform
   
   gcloud ai-platform models create waste_classifier \
     --regions=asia-south1
   
   gcloud ai-platform versions create v1 \
     --model=waste_classifier \
     --origin=gs://reloop-models/waste_classifier \
     --runtime-version=2.8 \
     --framework=tensorflow \
     --python-version=3.7
   ```

2. **Test Model Endpoint**
   ```bash
   # Test prediction endpoint
   curl -X POST \
     -H "Authorization: Bearer $(gcloud auth print-access-token)" \
     -H "Content-Type: application/json" \
     -d '{"instances": [{"image_bytes": {"b64": "base64_encoded_image"}}]}' \
     "https://asia-south1-ml.googleapis.com/v1/projects/reloop-production/models/waste_classifier:predict"
   ```

## 🌐 CDN and Static Assets

### Cloudflare Setup

1. **Add Domain to Cloudflare**
   ```bash
   # 1. Go to https://cloudflare.com
   # 2. Add site: reloop.com
   # 3. Update nameservers at domain registrar
   ```

2. **Configure CDN Settings**
   ```bash
   # 1. SSL/TLS > Overview > Full (strict)
   # 2. Speed > Optimization > Auto Minify (CSS, HTML, JS)
   # 3. Caching > Configuration > Browser Cache TTL: 1 year
   # 4. Security > WAF > Enable
   ```

## 📊 Monitoring Setup

### Sentry (Error Tracking)

1. **Create Sentry Project**
   ```bash
   # 1. Go to https://sentry.io
   # 2. Create organization: "ReLoop"
   # 3. Create projects: "reloop-backend" and "reloop-frontend"
   ```

2. **Configure Alerts**
   ```bash
   # 1. Alerts > Create Alert Rule
   # 2. Set conditions for error rates
   # 3. Configure notification channels (email, Slack)
   ```

### DataDog (Application Monitoring)

1. **Create DataDog Account**
   ```bash
   # 1. Go to https://datadoghq.com
   # 2. Create account
   # 3. Get API key from Organization Settings
   ```

2. **Install DataDog Agent**
   ```bash
   # On your server
   DD_API_KEY=your_api_key bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_script.sh)"
   ```

## 🚀 Deployment Options

### Option 1: Docker Compose (Simple)

1. **Server Setup**
   ```bash
   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/your-org/reloop.git
   cd reloop
   
   # Copy and configure environment files
   cp reloop-backend/.env.example reloop-backend/.env
   cp .env.example .env.production
   
   # Edit environment files with production values
   nano reloop-backend/.env
   nano .env.production
   
   # Deploy with Docker Compose
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Option 2: Kubernetes (Scalable)

1. **Create Kubernetes Cluster**
   ```bash
   # Using Google Kubernetes Engine
   gcloud container clusters create reloop-cluster \
     --zone=asia-south1-a \
     --num-nodes=3 \
     --machine-type=e2-standard-2 \
     --enable-autoscaling \
     --min-nodes=1 \
     --max-nodes=10
   ```

2. **Deploy with Helm**
   ```bash
   # Install Helm
   curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
   
   # Deploy application
   helm install reloop ./k8s/helm-chart \
     --namespace=production \
     --create-namespace \
     --values=./k8s/values.prod.yaml
   ```

### Option 3: Railway (Managed)

1. **Deploy Backend**
   ```bash
   # 1. Go to https://railway.app
   # 2. Connect GitHub repository
   # 3. Deploy from reloop-backend folder
   # 4. Add PostgreSQL and Redis services
   # 5. Configure environment variables
   ```

2. **Deploy Frontend**
   ```bash
   # 1. Create new Railway service
   # 2. Deploy from root folder
   # 3. Configure build command: npm run build
   # 4. Configure start command: npm run preview
   ```

## 🔧 Environment Configuration

### Backend Production Environment

Create `/reloop-backend/.env` with production values:

```bash
# Copy from .env.example and fill in real values
cp .env.example .env

# Critical variables to update:
# - DATABASE_URL (Supabase connection string)
# - REDIS_URL (Upstash connection string)
# - JWT_SECRET (generate strong secret)
# - All API keys and service credentials
```

### Frontend Production Environment

Create `/.env.production` with production values:

```bash
# Copy from .env.example and fill in real values
cp .env.example .env.production

# Critical variables to update:
# - VITE_API_URL (your backend URL)
# - All public API keys (Google Maps, Stripe, etc.)
```

## 🔒 Security Hardening

### 1. Server Security
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Install fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

### 2. SSL Configuration
```bash
# Strong SSL configuration in Nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
ssl_prefer_server_ciphers off;
add_header Strict-Transport-Security "max-age=63072000" always;
```

### 3. Database Security
```bash
# Enable SSL for database connections
# Configure IP whitelisting
# Regular security updates
# Backup encryption
```

## 📋 Post-Deployment Checklist

### Functionality Testing
- [ ] User registration and login
- [ ] Waste submission and classification
- [ ] Payment processing (test transactions)
- [ ] Email and SMS notifications
- [ ] File uploads to cloud storage
- [ ] Maps and location services
- [ ] Community features
- [ ] Admin panel access

### Performance Testing
- [ ] Load testing with realistic traffic
- [ ] Database query optimization
- [ ] CDN cache hit rates
- [ ] API response times
- [ ] Mobile app performance

### Security Testing
- [ ] SSL certificate validation
- [ ] API endpoint security
- [ ] Input validation testing
- [ ] Rate limiting verification
- [ ] Authentication flow testing

### Monitoring Setup
- [ ] Error tracking alerts configured
- [ ] Performance monitoring dashboards
- [ ] Database monitoring
- [ ] Server resource monitoring
- [ ] Uptime monitoring

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd reloop-backend && npm ci
          npm ci
          
      - name: Run tests
        run: |
          cd reloop-backend && npm test
          npm test
          
      - name: Build applications
        run: |
          cd reloop-backend && npm run build
          npm run build
          
      - name: Deploy to production
        run: |
          # Your deployment script here
          ./scripts/deploy-production.sh
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check connection string format
   # Verify firewall rules
   # Check SSL requirements
   ```

2. **API Key Issues**
   ```bash
   # Verify API key permissions
   # Check rate limits
   # Validate domain restrictions
   ```

3. **File Upload Problems**
   ```bash
   # Check cloud storage permissions
   # Verify CORS configuration
   # Check file size limits
   ```

### Monitoring and Logs

```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Check system resources
htop
df -h
free -m

# Monitor database performance
# Check Supabase dashboard
# Review slow query logs
```

## 📞 Support Contacts

- **Technical Support**: tech@reloop.com
- **Emergency Contact**: +977-1-1234567
- **Documentation**: https://docs.reloop.com
- **Status Page**: https://status.reloop.com

---

**Remember**: Always test in a staging environment before deploying to production!
