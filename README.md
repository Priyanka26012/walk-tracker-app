# Walk Tracker App

A React Native application that allows users to track their walking routes using GPS and display them on an interactive map.

## Features

- Start/Stop walk tracking
- Real-time GPS coordinate recording
- Interactive Google Maps integration
- Walking duration tracking
- Save and view past walks
- Clean and intuitive UI

## Prerequisites

- Node.js >= 18
- React Native development environment set up
- Google Maps API key for both iOS and Android

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd walk-tracker-app
```

2. Install dependencies:
```bash
yarn install
```

3. iOS Setup:
```bash
cd ios
pod install
cd ..
```

4. Configure Google Maps:
   - Get a Google Maps API key from the Google Cloud Console
   - For iOS: Add your API key to `ios/walkTrackerApp/AppDelegate.mm`
   - For Android: Add your API key to `android/app/src/main/AndroidManifest.xml`

5. Start the application:
```bash
# For iOS
yarn ios

# For Android
yarn android
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # Screen components
├── hooks/         # Custom React hooks
├── services/      # API and service integrations
├── utils/         # Utility functions
└── types/         # TypeScript type definitions
```

## Features Implementation

### Core Features
- Location tracking using react-native-maps
- Walk recording with GPS coordinates
- Local storage using AsyncStorage
- Navigation using React Navigation

### Screens
1. Home Screen
   - Interactive map
   - Start/Stop walk button
   - Walking timer
   - Current route display

2. Saved Walks Screen
   - List of completed walks
   - Walk details (date, duration)
   - Map view of saved routes

## Known Limitations

- Location tracking stops when app is in background
- Basic error handling for GPS issues
- Simple UI without advanced animations

## Future Improvements

- Background location tracking
- Distance calculation
- Walk statistics
- Enhanced error handling
- Improved UI/UX
- Map markers for start/end points

## Testing

The app has been tested on:
- iOS Simulator (iPhone 14)
- Android Emulator (Pixel 6)
- Physical devices (iPhone 13, Samsung Galaxy S21)

## License

MIT
