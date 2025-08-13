# KP5 Academy Backend

A robust, scalable backend API for the KP5 Academy Sports Management Platform built with Node.js, Express, TypeScript, PostgreSQL, and Prisma.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **API**: RESTful API with comprehensive CRUD operations
- **Security**: Helmet, CORS, rate limiting, input validation
- **File Upload**: Support for image and document uploads
- **Payments**: Stripe integration for payment processing
- **Email**: Nodemailer for email notifications
- **Logging**: Winston logger with structured logging
- **Docker**: Containerized deployment with Docker and Docker Compose

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Express-validator + Zod
- **File Upload**: Multer + Sharp
- **Payments**: Stripe
- **Email**: Nodemailer
- **Logging**: Winston
- **Containerization**: Docker + Docker Compose

## 📋 Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- Docker and Docker Compose (optional)
- Redis (optional, for caching)

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kp5-academy/backend
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   docker-compose exec backend npm run db:migrate
   ```

5. **Seed the database (optional)**
   ```bash
   docker-compose exec backend npm run db:seed
   ```

6. **Access the API**
   - API: http://localhost:3001
   - Health check: http://localhost:3001/health
   - Prisma Studio: http://localhost:5555

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database and user
   createdb kp5_academy
   createuser kp5_user
   psql -d kp5_academy -c "ALTER USER kp5_user WITH PASSWORD 'kp5_password';"
   psql -d kp5_academy -c "GRANT ALL PRIVILEGES ON DATABASE kp5_academy TO kp5_user;"
   ```

4. **Generate Prisma client**
   ```bash
   npm run db:generate
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Application entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── uploads/             # File uploads directory
├── logs/                # Application logs
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose configuration
└── package.json         # Dependencies and scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database with sample data
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Available Roles

- `SUPER_ADMIN` - Full system access
- `CLUB_ADMIN` - Club management access
- `COACH` - Team and player management
- `PLAYER` - Basic player access
- `PARENT` - Parent access to child's data
- `REFEREE` - Match management access

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Clubs
- `GET /api/clubs` - Get all clubs
- `POST /api/clubs` - Create new club
- `GET /api/clubs/:id` - Get club by ID
- `PUT /api/clubs/:id` - Update club
- `DELETE /api/clubs/:id` - Delete club

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create new team
- `GET /api/teams/:id` - Get team by ID
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event by ID
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Matches
- `GET /api/matches` - Get all matches
- `POST /api/matches` - Create new match
- `GET /api/matches/:id` - Get match by ID
- `PUT /api/matches/:id` - Update match
- `DELETE /api/matches/:id` - Delete match

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `POST /api/tournaments` - Create new tournament
- `GET /api/tournaments/:id` - Get tournament by ID
- `PUT /api/tournaments/:id` - Update tournament
- `DELETE /api/tournaments/:id` - Delete tournament

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions based on user roles
- **Input Validation**: Comprehensive request validation using express-validator and Zod
- **Rate Limiting**: Protection against brute force attacks
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Helmet**: Security headers for Express
- **Password Hashing**: Bcrypt for secure password storage
- **SQL Injection Protection**: Prisma ORM prevents SQL injection

## 📝 Environment Variables

Copy `env.example` to `.env` and configure the following variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS
- `REDIS_URL` - Redis connection string (optional)
- `SMTP_*` - Email configuration
- `STRIPE_*` - Stripe payment configuration

## 🐳 Docker Deployment

The application is containerized with Docker and includes:

- **Multi-stage build** for optimized production images
- **Health checks** for container monitoring
- **Non-root user** for security
- **Docker Compose** for easy local development

### Production Deployment

1. **Build the image**
   ```bash
   docker build -t kp5-academy-backend .
   ```

2. **Run with environment variables**
   ```bash
   docker run -d \
     --name kp5-backend \
     -p 3001:3001 \
     -e DATABASE_URL="postgresql://..." \
     -e JWT_SECRET="your-secret" \
     kp5-academy-backend
   ```

## 🧪 Testing

Run tests with:

```bash
npm test
```

## 📈 Monitoring

The application includes comprehensive logging and monitoring:

- **Structured logging** with Winston
- **Request logging** with Morgan
- **Error tracking** with detailed error handling
- **Health check endpoint** at `/health`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository. 