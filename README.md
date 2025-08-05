# KP5 Academy - Sports Management Platform

A comprehensive, full-featured sports management platform with web and mobile applications, built with Next.js, React Native, and Firebase.

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
- **Push Notification Handling** - Real-time notifications with FCM
- **Camera Integration** - Match photos and video capture
- **GPS Location Services** - Venue location and directions
- **Background Sync** - Automatic data synchronization

## 🛠 Tech Stack

### Frontend
- **Web**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Mobile**: React Native, Expo, TypeScript, Tailwind CSS

### Backend
- **Firebase**: Firestore, Auth, Storage, Cloud Functions, Hosting
- **Real-time**: Firestore listeners, FCM push notifications
- **Payments**: Stripe integration via Cloud Functions

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
├── firebase/             # Firebase configuration
│   ├── functions/        # Cloud Functions
│   ├── firestore.rules   # Security rules
│   └── storage.rules     # Storage rules
└── docs/                 # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
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
```

### 2. Firebase Setup

1. Create a new Firebase project
2. Enable Authentication, Firestore, Storage, and Cloud Functions
3. Copy your Firebase config to environment files

```bash
# Copy environment examples
cp web/env.example web/.env.local
cp mobile/env.example mobile/.env
```

### 3. Environment Configuration

#### Web App (.env.local)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

#### Mobile App (.env)
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

### 4. Firebase Emulator Setup (Development)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Start emulators
firebase emulators:start
```

### 5. Run Development Servers

```bash
# Terminal 1: Web app
cd web
npm run dev

# Terminal 2: Mobile app
cd mobile
npx expo start

# Terminal 3: Firebase emulators
firebase emulators:start
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

# Shared tests
cd shared && npm test
```

### Test Coverage
```bash
npm run test:coverage
```

## 🚀 Deployment

### Web App (Firebase Hosting)
```bash
cd web
npm run build
firebase deploy --only hosting
```

### Mobile App (Expo)
```bash
cd mobile
npx expo build:android
npx expo build:ios
```

### Cloud Functions
```bash
firebase deploy --only functions
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

### Firebase Security Rules
- Implement role-based access control
- Validate data on write operations
- Use proper authentication checks
- Secure file uploads

### API Security
- Validate all inputs
- Implement rate limiting
- Use HTTPS for all requests
- Secure environment variables

## 📊 Monitoring & Analytics

### Performance Monitoring
- Firebase Performance Monitoring
- Lighthouse CI integration
- Bundle size analysis
- Error tracking with Sentry

### Analytics
- Firebase Analytics
- User behavior tracking
- Conversion tracking
- Custom event tracking

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

- Firebase team for the excellent platform
- Expo team for React Native tooling
- Vercel team for Next.js
- All contributors and supporters

---

**Built with ❤️ for the sports community** 