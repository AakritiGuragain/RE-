# ReLoop - Comprehensive Waste Transformation & Recycling Platform

<div align="center">
  <img src="https://via.placeholder.com/200x200/22c55e/ffffff?text=ReLoop" alt="ReLoop Logo" width="200" height="200">
  
  <h3>🌱 Transforming Waste into Value for Kathmandu Valley 🌱</h3>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18+-61dafb)](https://reactjs.org/)
  [![NestJS](https://img.shields.io/badge/NestJS-10+-e0234e)](https://nestjs.com/)
</div>

## 🌟 Overview

ReLoop is a comprehensive community-driven waste transformation and recycling platform designed specifically for Kathmandu Valley, Nepal. The platform combines cutting-edge technology with environmental consciousness to create a sustainable ecosystem where waste becomes a valuable resource.

### 🎯 Mission
To revolutionize waste management in Nepal by empowering communities, rewarding sustainable behavior, and creating economic opportunities through innovative recycling and upcycling initiatives.

## ✨ Key Features

### 🔐 User Management & Authentication
- **Secure Authentication**: JWT-based auth with 2FA support
- **Role-Based Access Control**: USER, ADMIN, ARTIST, BRAND_PARTNER roles
- **Profile Management**: Comprehensive user profiles with preferences
- **Social Integration**: Community features and user interactions

### 🗂️ Waste Tracking & Classification
- **AI-Powered Classification**: Automatic waste categorization using machine learning
- **Barcode Scanning**: Quick product identification and categorization
- **Impact Tracking**: Real-time CO₂ savings and environmental impact metrics
- **Smart Submissions**: Photo-based waste submission with validation

### 🎁 Reward System
- **Points Economy**: Earn points for recycling activities
- **Multiple Redemption Options**: Cash, art, event tickets, discounts
- **Leaderboards**: Community rankings and achievements
- **Transaction History**: Complete audit trail of all point activities

### 🛒 Marketplace (Bazar)
- **Upcycled Products**: Marketplace for recycled and upcycled goods
- **Artist Collaboration**: Platform for local artists to sell eco-friendly creations
- **Secure Payments**: Multiple payment gateways including local options (Khalti, eSewa)
- **Order Management**: Complete e-commerce functionality

### 👥 Community Features
- **Social Feed**: Share recycling achievements and tips
- **Content Types**: Hotspots, achievements, tips, general posts
- **Engagement**: Likes, comments, and social interactions
- **Content Moderation**: AI-assisted content filtering

### 📍 Drop Points & Logistics
- **Interactive Map**: Real-time drop point locations and status
- **IoT Integration**: Smart bin monitoring with fill-level sensors
- **Pickup Requests**: On-demand waste collection services
- **Route Optimization**: Efficient logistics management

### 🔔 Notifications System
- **Multi-Channel**: Email, SMS, push, and in-app notifications
- **Smart Preferences**: Customizable notification settings
- **Real-Time Updates**: Instant updates on activities and achievements
- **Bulk Messaging**: Admin broadcast capabilities

### 🎮 Gamification
- **Achievement Badges**: Unlock badges for various milestones
- **Eco Missions**: Complete challenges for extra rewards
- **Progress Tracking**: Visual progress indicators and statistics
- **Impact Portfolio**: Personal environmental impact dashboard

### 🔧 Admin & Analytics
- **Comprehensive Dashboard**: Real-time analytics and insights
- **User Management**: Advanced user administration tools
- **Content Moderation**: Efficient content review and management
- **System Configuration**: Flexible platform configuration options

### 🌐 Integrations
- **AI Services**: Google Cloud AI, custom TensorFlow models
- **Payment Gateways**: Stripe, Khalti, eSewa, Fonepay
- **Maps & Location**: Google Maps integration
- **Translation**: Multi-language support (English, Nepali)
- **IoT Devices**: MQTT-based smart bin connectivity
- **Analytics**: Google Analytics, custom environmental metrics

## 🏗️ Architecture

### Backend Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   NestJS API    │    │   PostgreSQL    │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │     Redis       │
                       │   (Caching)     │
                       └─────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: React Query + React Context
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library

#### Backend
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Authentication**: JWT with Passport
- **Validation**: Class Validator + Joi
- **Documentation**: OpenAPI/Swagger
- **Testing**: Jest + Supertest

#### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (production)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana
- **Logging**: Winston + ELK Stack

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/reloop.git
cd reloop
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd reloop-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your database credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/reloop"
# JWT_SECRET="your-super-secret-jwt-key"
# REDIS_URL="redis://localhost:6379"

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate:dev

# Seed the database
npm run prisma:seed

# Start the backend server
npm run start:dev
```

The backend API will be available at `http://localhost:3000`

### 3. Frontend Setup
```bash
# Navigate to frontend directory (from root)
cd src

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Update .env.local with your configuration
# VITE_API_URL=http://localhost:3000

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Docker Setup (Alternative)
```bash
# Run with Docker Compose
docker-compose up -d

# The application will be available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Database: localhost:5432
# Redis: localhost:6379
```

## 📖 API Documentation

Once the backend is running, visit `http://localhost:3000/api/docs` for interactive API documentation powered by Swagger.

### Key API Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

#### Waste Management
- `POST /waste/classify-image` - AI waste classification
- `POST /waste/submit-recycled` - Submit recycled waste
- `GET /waste/categories` - Get waste categories
- `GET /waste/user-stats` - Get user waste statistics

#### Rewards
- `GET /rewards/user-points` - Get user points
- `POST /rewards/points/redeem` - Redeem points
- `GET /rewards/leaderboard` - Get leaderboard
- `GET /rewards/points/history` - Get points history

#### Community
- `GET /posts` - Get community posts
- `POST /posts` - Create new post
- `POST /posts/:id/like` - Like a post
- `POST /posts/:id/comment` - Comment on post

#### Marketplace
- `GET /bazar/products` - Get products
- `POST /bazar/products` - Create product (artists)
- `GET /bazar/cart` - Get user cart
- `POST /bazar/cart` - Add to cart
- `POST /bazar/checkout` - Checkout process

## 🧪 Testing

### Backend Testing
```bash
cd reloop-backend

# Unit tests
npm run test

# Integration tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Testing
```bash
cd src

# Unit tests
npm run test

# UI tests
npm run test:ui

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Update production environment variables
   cp .env.example .env.production
   # Configure production database, Redis, and external services
   ```

2. **Build Applications**
   ```bash
   # Build backend
   cd reloop-backend && npm run build
   
   # Build frontend
   cd ../src && npm run build
   ```

3. **Database Migration**
   ```bash
   cd reloop-backend
   npm run prisma:migrate:deploy
   ```

4. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/reloop

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret

# Redis
REDIS_URL=redis://localhost:6379

# External Services
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_KEY_FILE=path/to/service-account.json
STRIPE_SECRET_KEY=sk_test_...
KHALTI_SECRET_KEY=your-khalti-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# AI Services
AI_CLASSIFIER_API_URL=https://your-ai-service.com
AI_CLASSIFIER_API_KEY=your-ai-api-key
```

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=ReLoop
VITE_GOOGLE_MAPS_API_KEY=your-maps-api-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 📚 Documentation

- [Scalability Strategy](./docs/SCALABILITY_STRATEGY.md)
- [Security Strategy](./docs/SECURITY_STRATEGY.md)
- [Integration Strategy](./docs/INTEGRATION_STRATEGY.md)
- [API Documentation](http://localhost:3000/api/docs)
- [Database Schema](./reloop-backend/prisma/schema.prisma)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure code passes all linting and formatting checks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- The amazing open-source community
- Environmental organizations in Nepal
- Local artists and recycling initiatives
- Contributors and beta testers

## 📞 Support

For support, email support@reloop.com or join our community Discord server.

---

<div align="center">
  <p><strong>Made with ❤️ for a sustainable future in Nepal</strong></p>
  <p>🌱 Every small action creates a big impact 🌱</p>
</div>
