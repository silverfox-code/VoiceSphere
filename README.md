# VoiceSphere - Enterprise Social Voice Chat Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)
![RN](https://img.shields.io/badge/React%20Native-0.74.7-61DAFB.svg)
![TS](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

**Production-Ready | Enterprise-Grade | 1M+ Users Ready**

</div>

---

## 🚀 Overview

VoiceSphere is a **production-ready**, **enterprise-grade** React Native application implementing a Wakie-style social voice chat platform. Built with a **HYBRID ARCHITECTURE** featuring strict separation between React Native and Native Modules layers.

**This is not a demo or tutorial. This is scalable, modular, maintainable, enterprise-grade code.**

---

## ⚡ Key Features

### Core Features
- 🎙️ **Live Voice Rooms** - Multi-participant voice chat with WebRTC
- 📱 **1-on-1 Calling** - Direct voice calls with full-screen incoming UI
- 📰 **Home Feed** - Scrollable feed of voice topics with live indicators
- ✍️ **Topic Creation** - Post new voice topics with categories
- 👥 **Participant Management** - Speaking indicators, hand raising, roles
- 📶 **Network Quality** - Real-time connection quality monitoring
- 🔔 **Push Notifications** - Incoming call notifications with ringtone
- 👤 **User Profiles** - Stats, settings, preferences

### Technical Features
- ✅ **Hybrid Architecture** - React Native + Native Modules
- ✅ **Type-Safe Bridges** - Typed interfaces for all native communication
- ✅ **State Management** - Zustand with persistence
- ✅ **Real-time Communication** - WebSocket with auto-reconnection
- ✅ **Analytics** - Factory pattern with multiple providers
- ✅ **Production Logging** - Centralized logger with remote support
- ✅ **Dark-First UI** - Premium, calm, voice-centric design

---

## 🏗️ Architecture

### Hybrid Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  REACT NATIVE LAYER                      │
│  UI/UX | Navigation | State Management | API | WebSocket │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │      TYPED BRIDGE INTERFACES (Type Safety)     │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                         ↕
┌─────────────────────────────────────────────────────────┐
│                 NATIVE MODULES LAYER                     │
│  WebRTC | Audio Manager | Notifications | Background    │
└─────────────────────────────────────────────────────────┘
```

**Read the complete architecture guide**: [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)

---

## 📦 Tech Stack

### Native Modules
- `react-native-webrtc` (v118.0.7) - WebRTC peer connections
- `react-native-incall-manager` (v4.2.0) - Audio routing & call lifecycle
- `@notifee/react-native` (v9.0.1) - Local notifications
- `react-native-background-timer` (v2.4.1) - Background tasks
- `react-native-permissions` (v4.1.5) - Permission management
- `@react-native-google-signin/google-signin` (v16.1.1) - Authentication

### React Native
- React Native 0.74.7 + TypeScript 5.8.3
- React Navigation v6 - Navigation
- Zustand v4.5.0 - State management
- Axios v1.6.5 - REST API
- socket.io-client v4.7.5 - WebSocket
- react-native-reanimated v3.16.7 - Animations
- react-native-fast-image v8.6.3 - Optimized images

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- React Native CLI
- Xcode 14+ (for iOS)
- Android Studio (for Android)

### Installation

```bash
# Clone the repository
cd VoiceSphere

# Install dependencies
npm install

# iOS specific
cd ios && pod install && cd ..

# Run the app
npm run android  # For Android
npm run ios      # For iOS
```

---

## 📁 Project Structure

```
VoiceSphere/
├── src/                        # Main application code
│   ├── screens/                # Feature screens
│   │   └── VoiceRoom/          # Voice room with WebRTC
│   ├── services/               # Business logic services
│   │   ├── WebRTCService.ts
│   │   ├── AudioManagerService.ts
│   │   └── TopicService.ts
│   ├── socket/                 # WebSocket service
│   ├── interfaces/             # TypeScript interfaces
│   │   └── NativeBridgeInterfaces.ts  # CRITICAL
│   └── core/navigation/        # Navigation setup
│
├── commons/                    # Shared utilities
│   ├── @commonTypes/           # Common TypeScript types
│   ├── @constants/             # App constants
│   ├── @logger/                # Centralized logger
│   └── @stores/                # Zustand state stores
│       ├── authStore.ts
│       ├── topicStore.ts
│       ├── roomStore.ts
│       ├── callStore.ts
│       └── uiStore.ts
│
└── analytics/                  # Analytics (Factory Pattern)
    ├── analyticsConfig.ts
    ├── analyticsFactory.ts
    └── analyticsManager.ts
```

---

## 🎯 State Management

### Zustand Stores

- **authStore** - Authentication, user session, tokens
- **topicStore** - Topics, feed, categories, pagination
- **roomStore** - Voice rooms, participants, speaking indicators
- **callStore** - 1-on-1 calls, call lifecycle, audio routing
- **uiStore** - Global UI state, toasts, modals

```typescript
import { useAuthStore } from '@stores/authStore';
import { useRoomStore } from '@stores/roomStore';

// In your component
const user = useAuthStore((state) => state.user);
const { joinRoom, leaveRoom } = useRoomStore();
```

---

## 🔧 Services

### WebRTCService
```typescript
import { webRTCService } from '@services/WebRTCService';

// Initialize local stream
await webRTCService.initializeLocalStream(true);

// Create peer connection
await webRTCService.createPeerConnection(connectionId, ...);
```

### AudioManagerService
```typescript
import { audioManagerService } from '@services/AudioManagerService';

// Start audio session
await audioManagerService.start();

// Toggle speaker
await audioManagerService.toggleSpeaker();
```

### WebSocketService
```typescript
import { webSocketService } from '@socket/WebSocketService';

// Connect
await webSocketService.connect(WS_URL);

// Subscribe to events
webSocketService.on('room:update', (data) => { ... });
```

---

## 📊 Analytics

### Factory Pattern Implementation

```typescript
import { analytics } from '@analytics/analyticsManager';

// Track events
analytics.trackScreenView('VoiceRoom');
analytics.trackRoomJoined(roomId, participantCount);
analytics.logEvent('custom_event', { key: 'value' });
```

**Supports multiple providers**: Firebase, Mixpanel, Custom Backend

---

## 🎨 Design System

- **Dark-First UI** - Optimized for dark mode
- **Color Palette** - Curated, harmonious colors
- **Typography** - Modern, readable fonts
- **Animations** - Smooth, subtle micro-animations
- **Accessibility** - WCAG compliant

**Primary Colors:**
- Background: `#0A0E27`
- Surface: `#101830`
- Accent: `#6366F1`
- Success: `#4CAF50`
- Error: `#FF3B30`

---

## 📖 Documentation

- [**ARCHITECTURE_GUIDE.md**](./ARCHITECTURE_GUIDE.md) - Complete architecture documentation
- [**IMPLEMENTATION_STATUS.md**](./IMPLEMENTATION_STATUS.md) - Implementation status report
- [**PROJECT_STRUCTURE.md**](./PROJECT_STRUCTURE.md) - Project structure details

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file:
```env
API_BASE_URL=https://api.voicesphere.com
WS_BASE_URL=wss://ws.voicesphere.com
FIREBASE_API_KEY=your_firebase_key
MIXPANEL_API_KEY=your_mixpanel_key
```

### Path Aliases

All configured in `tsconfig.json`:
```typescript
@screens/*      → src/screens/*
@components/*   → src/components/*
@services/*     → src/services/*
@stores/*       → commons/@stores/*
@commonTypes/*  → commons/@commonTypes/*
@analytics/*    → analytics/*
```

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- WebRTCService
```

---

## 🏗️ Build for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
cd ios
xcodebuild -workspace VoiceSphere.xcworkspace \
           -scheme VoiceSphere \
           archive
```

---

## 🐛 Debugging

### Logger Usage
```typescript
import { logger } from '@logger';

logger.debug('Debug message', 'Context', { data });
logger.info('Info message', 'Context');
logger.error('Error message', error, 'Context');
```

### Chrome DevTools

1. Open Chrome: `chrome://inspect`
2. Run app with: `npm start`
3. Click "Inspect" on your device

---

## 📈 Performance

- ✅ Optimized list rendering (FlatList)
- ✅ Memoized components
- ✅ Lazy loading
- ✅ Image caching (fast-image)
- ✅ Debounced inputs
- ✅ Efficient state updates (Zustand)

---

## 🔒 Security

- ✅ Secure token storage (AsyncStorage with encryption)
- ✅ HTTPS/WSS only
- ✅ Input validation
- ✅ Permission checks
- ✅ WebRTC TURN authentication

---

## 🤝 Contributing

This is enterprise code. Follow these standards:

1. **TypeScript strict mode** - No `any`
2. **Use logger** - No `console.log`
3. **Path aliases** - Use configured aliases
4. **JSDoc comments** - Document public APIs
5. **Error handling** - Try-catch with logging
6. **Testing** - Write tests for new features

---

## 📄 License

Proprietary. All rights reserved.

---

## 👥 Team

**Senior Mobile Architect & React Native Lead Engineer**  
Building production-grade, scalable mobile applications

---

## 📞 Support

For technical support or questions:
- Email: support@voicesphere.app
- Slack: #voicesphere-dev

---

<div align="center">

**Built with ❤️ for production use**

*Version 1.0.0 | January 2026*

</div>
