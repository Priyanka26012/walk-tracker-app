# Walk Tracker App

A simple React Native app for tracking walks with GPS coordinates and map visualization.

## Features

- **Start/Stop Walk**: Simple button to start and stop walk tracking
- **Real-time Tracking**: GPS coordinates recorded while walking
- **Duration Display**: Shows current walking duration in real-time
- **Interactive Map**: Google Maps integration showing current location and route
- **Route Visualization**: Polyline display of walking route during active walk
- **Local Storage**: Saves completed walks to device storage
- **Walk History**: List of all saved walks with details
- **Walk Details**: View individual walk routes on map with statistics

## Screens

1. **Home Screen**: Map view with start/stop button and duration display
2. **Walk List Screen**: List of all saved walks
3. **Walk Detail Screen**: Individual walk route visualization with stats

## Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. For iOS, install pods:
```bash
cd ios && pod install
```

3. Run the app:
```bash
# iOS
npm run ios
# or
yarn ios

# Android
npm run android
# or
yarn android
```

## Permissions

The app requires location permissions to track walks. It will request permission on first launch.

## Data Structure

Walks are stored locally with the following structure:
- `id`: Unique identifier
- `coordinates`: Array of GPS coordinates (latitude, longitude)
- `duration`: Walk duration in seconds
- `timestamp`: When the walk was completed

## Usage

1. **Start a Walk**: Tap "Start Walk" on the home screen
2. **During Walk**: See real-time duration and route on map
3. **Stop Walk**: Tap "Stop Walk" to save the walk
4. **View Walks**: Tap "View Saved Walks" to see all walks
5. **Walk Details**: Tap any walk in the list to see detailed route and stats
6. **Delete Walks**: Use the delete button in the walk list

The app is designed to be simple and focused on core walk tracking functionality.

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
