# KP5 Academy - Sports Management Platform

A comprehensive, full-featured sports management platform with web and mobile applications, built with Next.js, React Native, and PostgreSQL.

## 🚀 Features

### Core Features
- **Multi-Role Authentication** - Super Admin, Club Admin, Coach, Player, Parent, Referee
- **Real-Time Match Data Entry** - Live match tracking with goals, cards, substitutions
- **Tournament & League Management** - Bracket generation, standings, statistics
- **Team & Club Management** - Roster management, player profiles, team statistics
- **Event Scheduling** - Practices, games, meetings with calendar integration
- **Payment Processing** - Stripe integration for registrations and subscriptions
- **Messaging & Notifications** - Team chat, push notifications, announcements
- **Media Management** - Photo/video upload, document storage
- **Public Pages** - SEO-optimized public profiles for clubs and teams

### Web App Features
- **Tournament Bracket Visualization** - Interactive tournament brackets
- **League Standings** - Real-time standings with live updates
- **Advanced Player Statistics** - Comprehensive player analytics dashboard
- **Registration Form Builder** - Custom forms with conditional logic
- **Payment Management Interface** - Subscription and payment tracking

### Mobile App Features
- **Offline Data Synchronization** - Work offline, sync when connected
- **Push Notification Handling** - Real-time notifications with Expo
- **Camera Integration** - Match photos and video capture
- **GPS Location Services** - Venue location and directions
- **Background Sync** - Automatic data synchronization

## 🛠 Tech Stack

### Frontend
- **Web**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Mobile**: React Native, Expo, TypeScript, Tailwind CSS

### Backend
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication with role-based access control
- **API**: RESTful API with comprehensive CRUD operations
- **Real-time**: WebSocket support for live updates
- **Payments**: Stripe integration
- **File Storage**: Cloud storage (AWS S3, Google Cloud Storage)
- **Push Notifications**: Expo Push Notifications + Web Push API

### Development
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Prettier, TypeScript
- **Performance**: Lighthouse CI, Bundle analysis

## 📦 Project Structure

```
kp5-Academy/
├── web/                    # Next.js web application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/          # Services and utilities
│   │   └── hooks/        # Custom React hooks
├── mobile/                # React Native mobile app
│   ├── src/
│   │   ├── screens/      # App screens
│   │   ├── components/   # Mobile UI components
│   │   ├── services/     # Mobile-specific services
│   │   └── hooks/        # Mobile hooks
├── shared/               # Shared types and utilities
│   ├── src/
│   │   ├── types/        # TypeScript type definitions
│   │   ├── services/     # Shared services
│   │   └── utils/        # Shared utilities
├── backend/              # PostgreSQL backend API
│   ├── src/
│   │   ├── controllers/  # API controllers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   └── prisma/       # Database schema
└── docs/                 # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Expo account (for mobile)
- Stripe account (for payments)

### 1. Clone and Install

```bash
git clone https://github.com/your-username/kp5-academy.git
cd kp5-academy

# Install root dependencies
npm install

# Install web app dependencies
cd web && npm install

# Install mobile app dependencies
cd ../mobile && npm install

# Install shared dependencies
cd ../shared && npm install

# Install backend dependencies
cd ../backend && npm install
```

### 2. Database Setup

1. Create a PostgreSQL database
2. Update the database connection string in `backend/.env`
3. Run database migrations

```bash
cd backend
npm run db:migrate
npm run db:seed
```

### 3. Environment Configuration

```bash
# Copy environment examples
cp web/env.example web/.env.local
cp mobile/env.example mobile/.env
cp backend/env.example backend/.env
```

### 4. Environment Configuration

#### Web App (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
NEXT_PUBLIC_FILE_UPLOAD_URL=http://localhost:3001/api/upload
```

#### Mobile App (.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
EXPO_PUBLIC_FILE_UPLOAD_URL=http://localhost:3001/api/upload
```

#### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/kp5_academy"
JWT_SECRET="your-super-secret-jwt-key"
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

### 5. Run Development Servers

```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Web app
cd web
npm run dev

# Terminal 3: Mobile app
cd mobile
npx expo start
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests by Project
```bash
# Web app tests
cd web && npm test

# Mobile app tests
cd mobile && npm test

# Backend tests
cd backend && npm test
```

### Test Coverage
```bash
npm run test:coverage
```

## 🚀 Deployment

### Backend API
```bash
cd backend
npm run build
npm start
```

### Web App (Vercel/Netlify)
```bash
cd web
npm run build
# Deploy to your preferred platform
```

### Mobile App (Expo)
```bash
cd mobile
npx expo build:android
npx expo build:ios
```

## 📱 Mobile App Development

### Expo Development
```bash
cd mobile
npx expo start
```

### iOS Simulator
```bash
npx expo start --ios
```

### Android Emulator
```bash
npx expo start --android
```

### Physical Device
1. Install Expo Go app
2. Scan QR code from terminal
3. App will load on device

## 🔧 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Use conventional commits
- Write tests for new features

### Component Guidelines
- Use shadcn/ui components for web
- Create reusable components in shared
- Follow mobile-first responsive design
- Implement proper error boundaries

### State Management
- Use React Query for server state
- Use React Context for global state
- Use local state for component-specific data
- Implement optimistic updates

### Performance
- Use React.memo for expensive components
- Implement proper loading states
- Use image optimization
- Enable code splitting

## 🔒 Security

### API Security
- JWT-based authentication with role-based access control
- Input validation using express-validator and Zod
- Rate limiting protection
- CORS configuration
- Helmet security headers
- Password hashing with bcrypt

### Database Security
- Prisma ORM prevents SQL injection
- Role-based access control
- Data validation at the database level
- Secure connection strings

## 📊 Monitoring & Analytics

### Performance Monitoring
- Application performance monitoring
- Database query optimization
- Error tracking and logging
- Uptime monitoring

### Analytics
- User behavior tracking
- Conversion tracking
- Custom event tracking
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Pull Request Guidelines
- Include tests for new features
- Update documentation
- Follow the existing code style
- Provide clear commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/kp5-academy/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/kp5-academy/discussions)

## 🗺 Roadmap

### Phase 1 (Current)
- ✅ Core authentication and user management
- ✅ Basic team and club management
- ✅ Real-time match data entry
- ✅ Tournament bracket generation

### Phase 2 (Next)
- 🔄 Advanced analytics dashboard
- 🔄 Mobile offline capabilities
- 🔄 Push notification system
- 🔄 Payment processing

### Phase 3 (Future)
- 📋 AI-powered match analysis
- 📋 Advanced reporting tools
- 📋 Integration with external APIs
- 📋 Multi-language support

## 🙏 Acknowledgments

- PostgreSQL team for the excellent database
- Expo team for React Native tooling
- Vercel team for Next.js
- All contributors and supporters

---

**Built with ❤️ for the sports community** 