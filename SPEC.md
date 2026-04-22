# Bridge - Dating App Specification

## 1. Project Overview

**Project Name**: Bridge
**Project Type**: Mobile-first Dating App
**Core Functionality**: A dating app enabling users to discover, match, and connect with potential partners through geolocation-based swiping and real-time messaging.
**Target Users**: Singles aged 18+ seeking casual or serious relationships
**Tech Stack**:
- Frontend: React Native with Expo (iOS/Android)
- Backend: Node.js with Express
- Database: MongoDB with Mongoose
- Real-time: Socket.io
- Auth: JWT + bcrypt

---

## 2. UI/UX Specification

### Screen Structure

1. **AuthStack** (Unauthenticated)
   - SplashScreen
   - LoginScreen
   - RegisterScreen
   - OnboardingScreen (multi-step profile creation)

2. **MainTab** (Authenticated)
   - HomeScreen (Discovery feed)
   - MatchesScreen (Match list)
   - ChatScreen (Messages list)
   - ProfileScreen (User profile)

### Navigation Structure
```
AuthStack
├── LoginScreen
├── RegisterScreen
└── OnboardingScreen

MainTab (Bottom Tabs)
├── HomeScreen (Discovery)
├── MatchesScreen
├── ChatListScreen
└── ProfileScreen

Stack Screens (from MainTab)
├── ChatScreen (individual chat)
├── ProfileViewScreen (view other user's profile)
├── EditProfileScreen
└── SettingsScreen
```

### Visual Design

**Color Palette**:
- Primary: #FF6B6B (Coral Red - passion/romance)
- Secondary: #4ECDC4 (Teal - fresh/trustworthy)
- Accent: #FFE66D (Warm Yellow - energy)
- Background: #FFFFFF
- Surface: #F7F7F7
- Text Primary: #2D3436
- Text Secondary: #636E72
- Text Muted: #B2BEC3
- Error: #E74C3C
- Success: #27AE60
- Gradient: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)

**Typography**:
- Font Family: System default (San Francisco on iOS, Roboto on Android)
- Heading Large: 28px, Bold (700), line-height 36px
- Heading Medium: 22px, SemiBold (600), line-height 28px
- Heading Small: 18px, SemiBold (600), line-height 24px
- Body Large: 16px, Regular (400), line-height 24px
- Body Medium: 14px, Regular (400), line-height 20px
- Body Small: 12px, Regular (400), line-height 16px
- Caption: 11px, Medium (500), line-height 14px

**Spacing System** (8pt grid):
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

**Border Radius**:
- Small: 8px
- Medium: 12px
- Large: 16px
- Full: 9999px (pill shape)

### Component Library

#### Buttons
- **PrimaryButton**: Gradient background (#FF6B6B → #FF8E53), white text, height 52px, radius 26px
- **SecondaryButton**: White background, primary border, primary text, height 52px, radius 26px
- **GhostButton**: Transparent background, primary text, height 44px
- **IconButton**: Circular, 44x44px, subtle background on press

#### Cards
- **ProfileCard**: Full-width card showing photo (aspect ratio 3:4), name/age overlay, gradient bottom
- **MatchCard**: Horizontal card, 80x80px avatar, name + match time
- **ChatCard**: Horizontal card, avatar, name, last message preview, timestamp

#### Inputs
- **TextInput**: Height 52px, background #F7F7F7, border-radius 12px, padding 16px
- **PasswordInput**: Same as TextInput with eye icon toggle
- **DateInput**: Same as TextInput with calendar icon
- **LocationInput**: Same as TextInput with location pin icon

#### Interactive Elements
- **SwipeCard**: Full-width card for swiping, drag gestures
- **LikeButton**: Heart icon, scale animation on press
- **PassButton**: X icon, subtle red background on press
- **SuperLikeButton**: Star icon, blue background
- **ReportModal**: Bottom sheet with options list

#### Navigation
- **BottomTab**: Height 60px + safe area, icons 24px, active color #FF6B6B
- **Header**: Height 56px, centered title, back arrow when applicable

### Animations & Transitions
- Swipe cards: Spring animation (damping: 0.7, stiffness: 100)
- Tab switch: Cross-fade 200ms
- Modal: Slide up 300ms ease-out
- Button press: Scale 0.95, 100ms
- Like heart: Scale 0 → 1.2 → 1, 300ms
- Match animation: Confetti burst + scale animation

---

## 3. Functionality Specification

### 3.1 User Authentication & Onboarding

#### Registration
- **Email + Password Signup**:
  - Email field with validation (format check)
  - Password field with strength indicator (min 8 chars, 1 number, 1 uppercase)
  - Submit creates pending user account

#### Age Verification
- Date of Birth input (mandatory)
- Calculate age: must be 18+
- Reject if under 18 with error message

#### Onboarding Flow (5 steps)
1. **Basic Info**: Name, DOB, gender (Man/Woman/Other), preferred gender
2. **Location**: Auto-detect or manual city input
3. **Photos**: Upload 1-6 photos (required at least 1)
4. **Interests**: Select from predefined tags (max 10)
5. **Bio**: Short bio (≤500 chars), "Two truths and a lie" prompts

#### Login
- Email + password authentication
- JWT token stored securely
- Auto-login if token valid

### 3.2 Profile Management

#### View Own Profile
- Display all photos (carousel/slider)
- Name, age, location
- Bio and prompts
- Interests as tags
- Edit button

#### Edit Profile
- Update any field
- Reorder photos
- Add/remove interests
- Edit prompts
- Changes saved immediately

#### Account Management
- **Deactivate**: Hide profile temporarily
- **Delete**: Permanent account deletion (with confirmation)

### 3.3 Discovery & Matching

#### Discovery Feed
- Geolocation-based user pool
- Distance: User-set radius (1-100 km)
- Cards show: Photo, name, age, distance, bio snippet
- Swipe right = Like, left = Pass

#### Filters
- Age range: 18-65+ (slider)
- Distance: 1-100 miles/km
- Gender preference: Men/Women/Everyone
- Relationship intent: Casual/Serious/Don't know yet

#### Daily Limits (Free Tier)
- 50 likes per day
- 10 super likes per day
- Reset at midnight local time

#### Premium Features (Out of scope for MVP)
- Unlimited likes
- Rewind last swipe
- See who liked you
- Passport (travel mode)

### 3.4 Matching System

#### Matching Logic
- User A likes User B → Like stored pending
- User B likes User A → Mutual match!
- Both users notified of match

#### Match Management
- View all matches in list
- Unmatch: Remove match, optionally block
- Report: Report with reason (Spam, Inappropriate, Other)

#### Notifications
- Push notification on new match
- In-app notification bell

### 3.5 Messaging

#### Chat Features
- Real-time messaging via Socket.io
- Text messages (max 1000 chars)
- Emoji picker
- Photo sharing (from gallery)
- Timestamps
- Read receipts
- Typing indicators

#### Chat List
- All matches displayed
- Sorted by most recent message
- Unread message count badge
- Last message preview

#### Message Reactions
- Like/heart reaction on messages
- Double-tap to react

### 3.6 Push Notifications

- New match notification
- New message notification
- New like notification (premium)
- Profile view notification (premium)

---

## 4. Technical Specification

### Database Schema

```javascript
// User Model
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  profile: {
    name: String,
    dob: Date,
    gender: String (enum: 'man', 'woman', 'other'),
    preferredGender: String (enum: 'man', 'woman', 'everyone'),
    location: {
      city: String,
      coordinates: [Number] // [lng, lat]
    },
    photos: [String], // URLs
    bio: String,
    interests: [String],
    prompts: [{
      question: String,
      answer: String
    }],
    height: String,
    education: String,
    relationshipGoal: String (enum: 'casual', 'serious', 'dont_know')
  },
  preferences: {
    ageMin: Number,
    ageMax: Number,
    maxDistance: Number,
    distanceUnit: String (enum: 'km', 'miles')
  },
  dailyLikes: {
    count: Number,
    resetDate: Date
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Match Model
{
  _id: ObjectId,
  users: [ObjectId], // User references
  createdAt: Date
}

// Message Model
{
  _id: ObjectId,
  matchId: ObjectId,
  senderId: ObjectId,
  text: String,
  photo: String,
  isRead: Boolean,
  reactions: [{
    userId: ObjectId,
    emoji: String
  }],
  createdAt: Date
}

// Swipe Model
{
  _id: ObjectId,
  fromUserId: ObjectId,
  toUserId: ObjectId,
  type: String (enum: 'like', 'pass', 'superlike'),
  createdAt: Date
}
```

### API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

PUT    /api/users/profile
GET    /api/users/profile/:userId

GET    /api/discovery/feed
POST   /api/discovery/swipe
GET    /api/discovery/filters

GET    /api/matches
GET    /api/matches/:matchId
DELETE /api/matches/:matchId

GET    /api/messages/:matchId
POST   /api/messages/:matchId
PUT    /api/messages/:matchId/:messageId/read

POST   /api/reports
POST   /api/block/:userId
```

### Socket Events

```
connection
disconnect
join_room (matchId)
leave_room (matchId)
send_message
receive_message
typing_start
typing_stop
message_read
```

---

## 5. Acceptance Criteria

### Authentication
- [ ] User can register with email/password
- [ ] User must verify age (18+) during onboarding
- [ ] User can login and maintain session
- [ ] JWT tokens secure authenticated routes

### Profile
- [ ] User can complete 5-step onboarding
- [ ] User can edit profile anytime
- [ ] User can deactivate/delete account

### Discovery
- [ ] User sees nearby profiles in swipe interface
- [ ] Swipe right creates like, left creates pass
- [ ] Filters correctly narrow results
- [ ] Daily limits enforced on free tier

### Matching
- [ ] Mutual likes create a match
- [ ] Both users notified of match
- [ ] User can view matches list
- [ ] User can unmatch/report

### Messaging
- [ ] Matched users can chat in real-time
- [ ] Messages display with timestamps
- [ ] Typing indicators show when typing
- [ ] Photos can be sent in chat

### Overall
- [ ] App builds successfully for iOS
- [ ] Core flows work without crashes
- [ ] Unit tests pass for critical paths