# External Services Configuration Guide

This guide provides step-by-step instructions for configuring all external services required for the ReLoop platform in production.

## 🗂️ Table of Contents

1. [Database Services](#database-services)
2. [Google Cloud Platform Services](#google-cloud-platform-services)
3. [Payment Gateways](#payment-gateways)
4. [Email Services](#email-services)
5. [SMS Services](#sms-services)
6. [AI/ML Services](#aiml-services)
7. [Maps & Location Services](#maps--location-services)
8. [IoT & MQTT Services](#iot--mqtt-services)
9. [Analytics Services](#analytics-services)
10. [CDN & File Storage](#cdn--file-storage)
11. [Monitoring & Logging](#monitoring--logging)
12. [Environment Configuration](#environment-configuration)

## 🗄️ Database Services

### PostgreSQL (Production)

#### Option 1: Supabase (Recommended for Nepal)
```bash
# 1. Go to https://supabase.com
# 2. Create a new project
# 3. Get your connection string from Settings > Database
```

**Environment Variables:**
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### Option 2: Railway
```bash
# 1. Go to https://railway.app
# 2. Create new project > Add PostgreSQL
# 3. Copy connection string from Variables tab
```

#### Option 3: Neon (Serverless PostgreSQL)
```bash
# 1. Go to https://neon.tech
# 2. Create database
# 3. Copy connection string
```

### Redis (Caching & Sessions)

#### Option 1: Upstash (Recommended)
```bash
# 1. Go to https://upstash.com
# 2. Create Redis database
# 3. Copy connection string
```

**Environment Variables:**
```env
REDIS_URL=rediss://:[PASSWORD]@[ENDPOINT]:6379
```

#### Option 2: Railway Redis
```bash
# Add Redis service to your Railway project
```

## ☁️ Google Cloud Platform Services

### 1. Setup Google Cloud Project
```bash
# 1. Go to https://console.cloud.google.com
# 2. Create new project: "reloop-production"
# 3. Enable billing
# 4. Create service account with required permissions
```

### 2. Enable Required APIs
```bash
# Enable these APIs in Google Cloud Console:
# - Cloud Storage API
# - Cloud Translation API
# - Maps JavaScript API
# - Places API
# - Geocoding API
# - Cloud Vision API (for image processing)
```

### 3. Create Service Account
```bash
# 1. Go to IAM & Admin > Service Accounts
# 2. Create service account: "reloop-backend"
# 3. Grant roles:
#    - Storage Admin
#    - Cloud Translation API User
#    - Cloud Vision API User
# 4. Create and download JSON key file
```

**Environment Variables:**
```env
GOOGLE_CLOUD_PROJECT_ID=reloop-production
GOOGLE_CLOUD_KEY_FILE=/path/to/service-account-key.json
# Or use base64 encoded key:
GOOGLE_CLOUD_CREDENTIALS_BASE64=[BASE64_ENCODED_JSON]
```

### 4. Cloud Storage Setup
```bash
# 1. Go to Cloud Storage
# 2. Create bucket: "reloop-uploads-prod"
# 3. Set permissions to public read for uploaded files
# 4. Enable CORS if needed
```

**Environment Variables:**
```env
GOOGLE_CLOUD_BUCKET=reloop-uploads-prod
```

### 5. Google Maps API
```bash
# 1. Go to APIs & Services > Credentials
# 2. Create API key
# 3. Restrict to your domains
# 4. Enable required APIs
```

**Environment Variables:**
```env
GOOGLE_MAPS_API_KEY=AIzaSy[YOUR_API_KEY]
```

## 💳 Payment Gateways

### 1. Stripe (International Payments)

#### Setup:
```bash
# 1. Go to https://stripe.com
# 2. Create account
# 3. Complete business verification
# 4. Get API keys from Dashboard > Developers > API keys
```

**Environment Variables:**
```env
# Backend
STRIPE_SECRET_KEY=sk_live_[YOUR_SECRET_KEY]
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_WEBHOOK_SECRET]

# Frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_[YOUR_PUBLISHABLE_KEY]
```

#### Webhook Setup:
```bash
# 1. Go to Stripe Dashboard > Developers > Webhooks
# 2. Add endpoint: https://yourdomain.com/integrations/webhooks/stripe
# 3. Select events: payment_intent.succeeded, payment_intent.payment_failed
# 4. Copy webhook secret
```

### 2. Khalti (Nepal Local Payment)

#### Setup:
```bash
# 1. Go to https://khalti.com
# 2. Create merchant account
# 3. Complete KYC verification
# 4. Get API credentials from merchant dashboard
```

**Environment Variables:**
```env
# Backend
KHALTI_SECRET_KEY=live_secret_key_[YOUR_SECRET]
KHALTI_PUBLIC_KEY=live_public_key_[YOUR_PUBLIC]

# Frontend
VITE_KHALTI_PUBLIC_KEY=live_public_key_[YOUR_PUBLIC]
```

### 3. eSewa (Nepal Local Payment)

#### Setup:
```bash
# 1. Go to https://esewa.com.np
# 2. Apply for merchant account
# 3. Complete verification process
# 4. Get integration credentials
```

**Environment Variables:**
```env
ESEWA_MERCHANT_CODE=[YOUR_MERCHANT_CODE]
ESEWA_SECRET_KEY=[YOUR_SECRET_KEY]
```

### 4. Fonepay (Nepal Mobile Payment)

#### Setup:
```bash
# 1. Contact Fonepay for merchant account
# 2. Complete integration process
# 3. Get API credentials
```

**Environment Variables:**
```env
FONEPAY_MERCHANT_CODE=[YOUR_MERCHANT_CODE]
FONEPAY_SECRET_KEY=[YOUR_SECRET_KEY]
```

## 📧 Email Services

### Option 1: SendGrid (Recommended)

#### Setup:
```bash
# 1. Go to https://sendgrid.com
# 2. Create account
# 3. Verify domain
# 4. Create API key with Mail Send permissions
```

**Environment Variables:**
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.[YOUR_API_KEY]
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=ReLoop
```

### Option 2: Mailgun

#### Setup:
```bash
# 1. Go to https://mailgun.com
# 2. Add and verify domain
# 3. Get API key and domain
```

**Environment Variables:**
```env
EMAIL_PROVIDER=mailgun
MAILGUN_API_KEY=[YOUR_API_KEY]
MAILGUN_DOMAIN=[YOUR_DOMAIN]
EMAIL_FROM=noreply@yourdomain.com
```

### Option 3: Gmail SMTP (Development/Small Scale)

**Environment Variables:**
```env
EMAIL_PROVIDER=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=[APP_PASSWORD]  # Generate app password in Google Account settings
EMAIL_FROM=your-email@gmail.com
```

## 📱 SMS Services

### Option 1: Sparrow SMS (Nepal)

#### Setup:
```bash
# 1. Go to https://sparrowsms.com
# 2. Create account and verify
# 3. Purchase SMS credits
# 4. Get API token from dashboard
```

**Environment Variables:**
```env
SMS_PROVIDER=sparrow
SPARROW_SMS_TOKEN=[YOUR_TOKEN]
SMS_FROM=ReLoop
```

### Option 2: Twilio (International)

#### Setup:
```bash
# 1. Go to https://twilio.com
# 2. Create account
# 3. Get phone number
# 4. Get Account SID and Auth Token
```

**Environment Variables:**
```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=[YOUR_ACCOUNT_SID]
TWILIO_AUTH_TOKEN=[YOUR_AUTH_TOKEN]
TWILIO_PHONE_NUMBER=[YOUR_TWILIO_NUMBER]
```

## 🤖 AI/ML Services

### Option 1: Custom TensorFlow Model on Google Cloud AI Platform

#### Setup:
```bash
# 1. Train your waste classification model
# 2. Deploy to Google Cloud AI Platform
# 3. Get prediction endpoint
```

**Environment Variables:**
```env
AI_PROVIDER=google_cloud_ai
AI_CLASSIFIER_API_URL=https://[REGION]-ml.googleapis.com/v1/projects/[PROJECT]/models/[MODEL]:predict
AI_MODEL_NAME=waste_classifier_v1
```

### Option 2: Custom API Endpoint

#### Setup:
```bash
# Deploy your model to any cloud service
# Ensure it accepts POST requests with image data
```

**Environment Variables:**
```env
AI_PROVIDER=custom
AI_CLASSIFIER_API_URL=https://your-ai-api.com/classify
AI_CLASSIFIER_API_KEY=[YOUR_API_KEY]
```

### Option 3: AWS Rekognition (Fallback)

#### Setup:
```bash
# 1. Go to AWS Console
# 2. Create IAM user with Rekognition permissions
# 3. Create custom labels project
```

**Environment Variables:**
```env
AI_FALLBACK_PROVIDER=aws_rekognition
AWS_ACCESS_KEY_ID=[YOUR_ACCESS_KEY]
AWS_SECRET_ACCESS_KEY=[YOUR_SECRET_KEY]
AWS_REGION=ap-south-1
AWS_REKOGNITION_PROJECT_ARN=[YOUR_PROJECT_ARN]
```

## 🗺️ Maps & Location Services

### Google Maps (Already configured above)

**Frontend Environment Variables:**
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSy[YOUR_API_KEY]
```

### Mapbox (Alternative)

#### Setup:
```bash
# 1. Go to https://mapbox.com
# 2. Create account
# 3. Get access token
```

**Environment Variables:**
```env
MAPBOX_ACCESS_TOKEN=pk.[YOUR_ACCESS_TOKEN]
```

## 🌐 IoT & MQTT Services

### Option 1: AWS IoT Core

#### Setup:
```bash
# 1. Go to AWS IoT Core
# 2. Create IoT policy and certificates
# 3. Get MQTT endpoint
```

**Environment Variables:**
```env
MQTT_PROVIDER=aws_iot
MQTT_BROKER_URL=ssl://[YOUR_ENDPOINT].iot.[REGION].amazonaws.com:8883
MQTT_CLIENT_CERT=/path/to/client.crt
MQTT_CLIENT_KEY=/path/to/client.key
MQTT_CA_CERT=/path/to/ca.crt
```

### Option 2: HiveMQ Cloud

#### Setup:
```bash
# 1. Go to https://hivemq.com
# 2. Create cluster
# 3. Get connection details
```

**Environment Variables:**
```env
MQTT_PROVIDER=hivemq
MQTT_BROKER_URL=ssl://[YOUR_CLUSTER].s1.eu.hivemq.cloud:8883
MQTT_USERNAME=[YOUR_USERNAME]
MQTT_PASSWORD=[YOUR_PASSWORD]
```

### Option 3: Eclipse Mosquitto (Self-hosted)

**Environment Variables:**
```env
MQTT_PROVIDER=mosquitto
MQTT_BROKER_URL=mqtt://your-server.com:1883
MQTT_USERNAME=reloop
MQTT_PASSWORD=[SECURE_PASSWORD]
```

## 📊 Analytics Services

### Google Analytics 4

#### Setup:
```bash
# 1. Go to https://analytics.google.com
# 2. Create property
# 3. Get Measurement ID
```

**Environment Variables:**
```env
# Frontend
VITE_GA_MEASUREMENT_ID=G-[YOUR_MEASUREMENT_ID]
```

### Mixpanel

#### Setup:
```bash
# 1. Go to https://mixpanel.com
# 2. Create project
# 3. Get project token
```

**Environment Variables:**
```env
MIXPANEL_TOKEN=[YOUR_PROJECT_TOKEN]
```

## 🌐 CDN & File Storage

### Cloudflare (Recommended)

#### Setup:
```bash
# 1. Go to https://cloudflare.com
# 2. Add your domain
# 3. Configure DNS
# 4. Enable CDN and security features
```

### AWS CloudFront + S3

#### Setup:
```bash
# 1. Create S3 bucket for static assets
# 2. Create CloudFront distribution
# 3. Configure origin and caching
```

**Environment Variables:**
```env
CDN_URL=https://[YOUR_DISTRIBUTION].cloudfront.net
AWS_S3_BUCKET=reloop-static-assets
```

## 📈 Monitoring & Logging

### Option 1: DataDog

#### Setup:
```bash
# 1. Go to https://datadoghq.com
# 2. Create account
# 3. Get API key
```

**Environment Variables:**
```env
DATADOG_API_KEY=[YOUR_API_KEY]
DATADOG_APP_KEY=[YOUR_APP_KEY]
```

### Option 2: New Relic

#### Setup:
```bash
# 1. Go to https://newrelic.com
# 2. Create account
# 3. Get license key
```

**Environment Variables:**
```env
NEW_RELIC_LICENSE_KEY=[YOUR_LICENSE_KEY]
NEW_RELIC_APP_NAME=ReLoop-Production
```

### Option 3: Sentry (Error Tracking)

#### Setup:
```bash
# 1. Go to https://sentry.io
# 2. Create project
# 3. Get DSN
```

**Environment Variables:**
```env
# Backend
SENTRY_DSN=https://[KEY]@[ORG].ingest.sentry.io/[PROJECT]

# Frontend
VITE_SENTRY_DSN=https://[KEY]@[ORG].ingest.sentry.io/[PROJECT]
```

## 🔧 Environment Configuration

### Production Backend (.env)
```env
# Application
NODE_ENV=production
PORT=3000
APP_NAME=ReLoop
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Redis
REDIS_URL=rediss://:[PASSWORD]@[ENDPOINT]:6379

# Authentication
JWT_SECRET=[GENERATE_STRONG_SECRET]
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=[GENERATE_DIFFERENT_SECRET]

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=reloop-production
GOOGLE_CLOUD_CREDENTIALS_BASE64=[BASE64_ENCODED_JSON]
GOOGLE_CLOUD_BUCKET=reloop-uploads-prod

# Payment Gateways
STRIPE_SECRET_KEY=sk_live_[YOUR_SECRET_KEY]
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_WEBHOOK_SECRET]
KHALTI_SECRET_KEY=live_secret_key_[YOUR_SECRET]
ESEWA_MERCHANT_CODE=[YOUR_MERCHANT_CODE]

# Email
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.[YOUR_API_KEY]
EMAIL_FROM=noreply@reloop.com
EMAIL_FROM_NAME=ReLoop

# SMS
SMS_PROVIDER=sparrow
SPARROW_SMS_TOKEN=[YOUR_TOKEN]

# AI Services
AI_PROVIDER=google_cloud_ai
AI_CLASSIFIER_API_URL=https://asia-south1-ml.googleapis.com/v1/projects/reloop-production/models/waste_classifier:predict

# Maps
GOOGLE_MAPS_API_KEY=AIzaSy[YOUR_API_KEY]

# IoT/MQTT
MQTT_PROVIDER=hivemq
MQTT_BROKER_URL=ssl://[YOUR_CLUSTER].s1.eu.hivemq.cloud:8883
MQTT_USERNAME=[YOUR_USERNAME]
MQTT_PASSWORD=[YOUR_PASSWORD]

# Analytics
MIXPANEL_TOKEN=[YOUR_PROJECT_TOKEN]

# Monitoring
SENTRY_DSN=https://[KEY]@[ORG].ingest.sentry.io/[PROJECT]
DATADOG_API_KEY=[YOUR_API_KEY]

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
BCRYPT_SALT_ROUNDS=12

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
UPLOAD_DESTINATION=cloud
```

### Production Frontend (.env.production)
```env
# API
VITE_API_URL=https://api.reloop.com

# Application
VITE_APP_NAME=ReLoop
VITE_NODE_ENV=production
VITE_APP_VERSION=1.0.0

# External Services
VITE_GOOGLE_MAPS_API_KEY=AIzaSy[YOUR_API_KEY]
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_[YOUR_PUBLISHABLE_KEY]
VITE_KHALTI_PUBLIC_KEY=live_public_key_[YOUR_PUBLIC]

# Analytics
VITE_GA_MEASUREMENT_ID=G-[YOUR_MEASUREMENT_ID]
VITE_MIXPANEL_TOKEN=[YOUR_PROJECT_TOKEN]
VITE_SENTRY_DSN=https://[KEY]@[ORG].ingest.sentry.io/[PROJECT]

# Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CHATBOT=true
VITE_ENABLE_VOICE_COMMANDS=true
VITE_ENABLE_NOTIFICATIONS=true

# Localization
VITE_DEFAULT_LANGUAGE=en
VITE_SUPPORTED_LANGUAGES=en,ne
VITE_CURRENCY=NPR
VITE_TIMEZONE=Asia/Kathmandu

# File Upload
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

## 🔐 Security Considerations

1. **API Keys**: Store in environment variables, never in code
2. **Secrets Rotation**: Regularly rotate API keys and secrets
3. **Access Control**: Use least privilege principle for service accounts
4. **Network Security**: Use HTTPS/TLS for all external communications
5. **Monitoring**: Set up alerts for unusual API usage patterns

## 📋 Deployment Checklist

- [ ] Database configured and migrated
- [ ] Redis cache configured
- [ ] Google Cloud services enabled and configured
- [ ] Payment gateways tested in sandbox mode
- [ ] Email service configured and tested
- [ ] SMS service configured and tested
- [ ] AI classification service deployed and tested
- [ ] Maps API configured with domain restrictions
- [ ] IoT/MQTT broker configured
- [ ] Analytics tracking implemented
- [ ] CDN configured for static assets
- [ ] Monitoring and error tracking configured
- [ ] All environment variables set in production
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] Backup and disaster recovery plan in place

## 🆘 Support & Troubleshooting

For service-specific issues:
- **Database**: Check connection strings and firewall rules
- **Payment**: Verify webhook endpoints and SSL certificates
- **Email/SMS**: Check API quotas and sender verification
- **AI Services**: Verify model deployment and API quotas
- **Maps**: Check API key restrictions and billing
- **IoT**: Verify certificate validity and connection security

Remember to test all integrations in a staging environment before deploying to production!
