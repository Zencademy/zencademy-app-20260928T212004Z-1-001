# Firebase Authentication Setup

This app now includes Firebase Authentication with email/password login and registration functionality.

## Features

- **Login Screen**: Users can sign in with email and password
- **Register Screen**: New users can create accounts with email and password
- **Authentication State Management**: Automatic routing based on authentication status
- **Logout Functionality**: Users can sign out from the profile screen
- **Elegant UI**: Clean, black and white design following app preferences

## File Structure

```
app/
├── (auth)/
│   ├── _layout.tsx          # Auth group layout
│   ├── login.tsx            # Login screen
│   └── register.tsx         # Register screen
├── (tabs)/
│   └── ProfileScreen.tsx    # Updated with logout functionality
├── _layout.tsx              # Updated with AuthProvider
└── index.tsx                # Root redirect based on auth state

components/
├── AuthContext.tsx          # Authentication context and hooks
└── XPContext.tsx            # Existing XP context

utils/
└── firebase.ts              # Firebase configuration
```

## How It Works

1. **App Startup**: The app checks authentication state on startup
2. **Unauthenticated Users**: Redirected to login screen
3. **Authenticated Users**: Redirected to main app tabs
4. **Login/Register**: Users can switch between login and register screens
5. **Logout**: Available in the profile screen

## Firebase Configuration

The app uses the existing Firebase project "zencademy-app" with:
- Project ID: zencademy-app
- API Key: AIzaSyBfawlR2MNMjF1NAtpeJwmGFNHVk2plBRg
- Storage Bucket: zencademy-app.firebasestorage.app

## Dependencies Added

- `firebase`: Core Firebase SDK
- `@react-native-firebase/app`: React Native Firebase app module
- `@react-native-firebase/auth`: React Native Firebase auth module

## Usage

1. **Login**: Enter email and password, tap "Sign In"
2. **Register**: Enter email, password, and confirm password, tap "Create Account"
3. **Logout**: Go to Profile screen and tap the logout button

## Security Features

- Password validation (minimum 6 characters)
- Email format validation
- Password confirmation matching
- Error handling for authentication failures
- Secure password input fields

## UI Design

- Clean, minimalist design
- Black and white color scheme
- Elegant typography
- Responsive layout with keyboard handling
- Loading states for better UX
