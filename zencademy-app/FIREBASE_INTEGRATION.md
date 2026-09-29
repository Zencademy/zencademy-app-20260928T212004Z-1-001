# Firebase Integration for Zencademy

## Overview

Zencademy now uses Firebase Firestore to store and synchronize all user data in real-time. This replaces the previous AsyncStorage implementation with a cloud-based solution that provides:

- **Real-time synchronization** across devices
- **Cloud backup** of all user progress
- **Cross-platform consistency** 
- **Automatic data persistence**

## Data Structure

### User Document Structure
Each user has a document in the `users` collection with the following structure:

```typescript
interface UserData {
  name: string;                    // User's display name
  brainType: string;              // User's brain type (e.g., "Logic Guru")
  level: number;                  // Current level (1-100)
  xp: number;                     // Current XP points
  streak: number;                 // Daily streak count
  onboardingChecked: boolean;     // Whether onboarding is complete
  unlockedBadges: string[];       // Array of unlocked badge IDs
  xpHistory: XPHistoryEntry[];    // Daily XP tracking
  timeHistory: TimeHistoryEntry[]; // Daily session time tracking
  completed: number;              // Total completed games
  completedStats: CompletedStats; // Stats by category/difficulty
  equippedBadge?: string;         // Currently equipped badge
  shopItems?: ShopItem[];         // Purchased shop items
  lastUpdated: Date;              // Last data update timestamp
}
```

## Key Features

### 1. Real-time Data Synchronization
- All data changes are immediately synced to Firebase
- Real-time listeners update the UI automatically
- Offline support with automatic sync when connection is restored

### 2. XP and Level Management
- XP is automatically calculated and stored
- Level progression is handled server-side
- XP history is tracked daily for statistics

### 3. Badge System
- Badges are unlocked and stored in Firebase
- Equipped badges are synced across devices
- Shop badges are tracked separately

### 4. Shop Integration
- Purchased items are stored in Firebase
- XP deductions are handled securely
- Purchase history is maintained

### 5. Statistics and Progress
- Game completion stats are tracked by category
- Session time is logged daily
- Streak counting is persistent

## Implementation Details

### UserDataService
The `UserDataService` class provides all Firebase operations:

```typescript
// Get user data
const userData = await userDataService.getUserData(userId);

// Update specific fields
await userDataService.updateUserData(userId, { level: 5, xp: 1000 });

// Add XP (handles level progression automatically)
await userDataService.addXP(userId, 500);

// Unlock badges
await userDataService.unlockBadge(userId, "badge-level-10");

// Purchase shop items
await userDataService.purchaseShopItem(userId, "badge-legend");

// Check if user is new
const isNew = await userDataService.isNewUser(userId);

// Reset user data to minimal values
await userDataService.resetUserDataToMinimal(userId);

### XPContext Integration
The `XPContext` now uses Firebase instead of AsyncStorage:

```typescript
const { xp, level, addXP, unlockBadge } = useXP();

// All operations are now async and sync to Firebase
await addXP(100);
await unlockBadge("badge-streak-10");
```

### Authentication Integration
When a user registers, their data is automatically initialized:

```typescript
// In AuthContext.tsx
const signUp = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await userDataService.initializeUserData(userCredential.user.uid, email);
};
```

## Security Rules

Firestore security rules ensure users can only access their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Migration from AsyncStorage

The migration from AsyncStorage to Firebase is automatic:

1. **New users**: Data is initialized with minimal values in Firebase on registration
2. **Existing users**: Data will be initialized with minimal defaults on first login
3. **Real-time sync**: All future changes are automatically synced

### Minimal Default Values for New Accounts

New accounts start with the following minimal values to ensure a clean, fresh start:

- **Level**: 1 (minimum level)
- **XP**: 0 (no experience points)
- **Streak**: 0 (no daily streak)
- **Completed Games**: 0 (no games completed)
- **Badges**: None unlocked
- **Shop Items**: None purchased
- **Name**: "Guest"
- **Brain Type**: "Logic Guru"
- **Onboarding**: Not completed
- **XP History**: Empty
- **Time History**: Empty
- **Completed Stats**: Empty

This ensures that new users start from the absolute beginning and must earn all their progress through gameplay, creating a fair and engaging experience for everyone.

## Benefits

### For Users
- **Cross-device sync**: Progress is available on all devices
- **Data backup**: No risk of losing progress
- **Real-time updates**: Changes appear instantly
- **Offline support**: Works without internet connection

### For Developers
- **Centralized data**: All user data in one place
- **Real-time capabilities**: Live updates across devices
- **Scalable**: Can handle millions of users
- **Secure**: Built-in authentication and security rules

## Error Handling

The system includes comprehensive error handling:

```typescript
try {
  await userDataService.addXP(userId, 100);
} catch (error) {
  console.error('Error adding XP:', error);
  // Handle error gracefully
}
```

## Performance Considerations

- **Efficient queries**: Only necessary data is fetched
- **Real-time listeners**: Automatically manage connections
- **Offline caching**: Data is cached locally for performance
- **Batch operations**: Multiple updates are batched when possible

## Future Enhancements

Potential future improvements:

1. **Analytics integration**: Track user behavior patterns
2. **Achievement system**: Server-side achievement validation
3. **Social features**: Friend lists and leaderboards
4. **Cloud functions**: Server-side game logic
5. **Push notifications**: Achievement and streak reminders
