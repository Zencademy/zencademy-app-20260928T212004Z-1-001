# Expo SDK 57 upgrade — 2026-09-29

Updated to Expo 57.0.26, React Native 0.86.3 and React 19.2.3, with the matching Expo/native dependency versions and npm lockfile.

## Compatibility changes

- Migrated React Navigation imports to the SDK 57 Expo Router entry points.
- Removed unused legacy packages: expo-av, react-native-confetti, react-native-linear-gradient, react-native-worklets-core, standalone React Navigation dependencies and Firebase types.
- Replaced removed BackHandler.removeEventListener calls with subscription.remove().
- Migrated Android navigation bar configuration to the expo-navigation-bar plugin; removed the obsolete edgeToEdgeEnabled setting.
- Normalized the new unspecified color scheme value to light.
- Replaced StyleSheet.absoluteFillObject and NodeJS timer types; adapted icon types and mappings.
- Fixed the previousData scope in badge rollback, the setXP name in DeveloperScreen, and ParticleZ state initialization order.

## Verification

- Expo dependency check: passed.
- Expo Doctor: 21/21 checks passed (upgrade-doctor-final.log).
- iOS production JavaScript/Hermes export: succeeded.
- Final iOS development bundle: HTTP 200, 13,118,296 bytes; manifest reports exposdk:57.0.0.
- TypeScript: 357 remaining diagnostics, down from 397. Existing application typing and missing-route issues remain; this is not a clean full-project typecheck.
- No native IPA/APK was built. On-device login and gameplay still require testing.

## Start

With Node and npm installed:

```powershell
npm ci
npx expo start --go --lan --offline
```

The offline flag prevents Expo account/certificate prompts in this local development session. It does not disable the application's Supabase network requests. Scan the QR with the iPhone Camera and open Expo Go for SDK 57, using the same Wi-Fi as the computer.

The pre-upgrade source/config backup is in ../zencademy-sdk54-backup. Temporary upgrade tooling is in ../zencademy-upgrade-tools. Both are outside the app directory so they are not picked up as application files.
