# Buttercut.ai App - Frontend (React Native + Expo)

A video editing application built with React Native and Expo that allows users to upload videos, add overlays (text, images, and video clips), and preview them in real-time.

## Features

### Core Functionality
- Upload/select videos from device storage
- Add multiple overlay types:
  - Text overlays with customizable positioning, timing, and styling
  - Image overlays with positioning and timing control
  - Video clip overlays
- Drag-and-drop positioning on video preview
- Timeline-based overlay timing control
- Real-time preview of video with overlays (frontend-only rendering)
- Submit videos to backend for server-side rendering with FFmpeg
- Track processing status and download rendered videos

### User Experience
- Intuitive video editor interface
- Visual timeline for overlay management
- Live preview with all overlays applied
- Progress tracking for video processing
- Native device integration (file picker, video player)

## Tech Stack

- **Framework**: React Native 0.81.5
- **Platform**: Expo ~54.0
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router
- **Video**: Expo AV & Expo Video
- **File Handling**: Expo Document Picker, Expo Image Picker
- **Animations**: React Native Reanimated

## Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn
- Expo CLI (installed automatically with the project)
- Expo Go app on your mobile device (for testing)

## Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Backend API URL

Create or update the API configuration file to point to your backend:

```typescript
// Update the API_URL in your config file
const API_URL = 'http://localhost:8000'; 
// For Mobile devices, use your computer's IP:
// const API_URL = 'http://192.168.1.x:8000';
```

### 3. Start the Development Server

```bash
# Start Expo development server
npm start

# Or run on specific platforms
npm run android    # Run on Android emulator/device
npm run ios        # Run on iOS simulator/device (macOS only)
npm run web        # Run in web browser
```

### 4. Open on Device

- Scan the QR code with Expo Go app (Android) or Camera app (iOS)
- Or press `a` for Android, `i` for iOS in the terminal

## Project Structure

```
frontend/
├── app/                    # Expo Router app directory
│   ├── index.tsx          # Home screen (video editor)
│   ├── _layout.tsx        # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
├── types/                 # TypeScript type definitions
├── assets/               # Images, fonts, and static assets
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Usage Guide

### 1. Upload a Video

1. Open the app
2. Tap "Select Video" or "Upload Video" button
3. Choose a video from your device storage
4. Video will load in the editor preview

### 2. Add Overlays

#### Text Overlay
1. Tap "Add Text" button
2. Enter your text content
3. Customize:
   - **Position**: Drag the text on the preview
   - **Timing**: Set start and end times on the timeline
   - **Style**: Change font size, color, and opacity
4. Preview updates in real-time

#### Image Overlay
1. Tap "Add Image" button
2. Select an image from your device
3. Position and time the overlay
4. Adjust scale and opacity

#### Video Clip Overlay
1. Tap "Add Clip" button
2. Select a video clip
3. Position and set timing
4. Clip plays during the specified time range

### 3. Preview

- Scrub through the timeline to see overlays appear/disappear
- Play the video to see real-time preview
- All overlays render on-device for instant feedback

### 4. Submit for Processing

1. When satisfied with your edits, tap "Submit"
2. Video and overlay metadata are sent to the backend
3. Receive a `job_id` for tracking
4. Monitor processing status
5. Download the final rendered video when complete

## API Integration

### Upload Video with Overlays

```typescript
const formData = new FormData();

// Add video file
formData.append('video', {
  uri: videoUri,
  type: 'video/mp4',
  name: 'video.mp4',
});

// Add overlay metadata
formData.append('metadata', JSON.stringify({
  overlays: [
    {
      type: 'text',
      content: 'Hello World',
      x: 100,
      y: 100,
      start_time: 0,
      end_time: 5,
      font_size: 36,
      color: 'white',
      opacity: 1.0
    }
  ]
}));

// Send to backend
const response = await fetch('http://localhost:8000/api/v1/upload', {
  method: 'POST',
  body: formData,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

const { job_id } = await response.json();
```

### Check Processing Status

```typescript
const response = await fetch(`http://localhost:8000/api/v1/status/${job_id}`);
const status = await response.json();

// Poll until complete
if (status.status === 'completed') {
  // Download the result
  const videoUrl = `http://localhost:8000/api/v1/result/${job_id}`;
}
```

## Development

### Available Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run lint       # Run ESLint
```

### Hot Reload

- Code changes automatically reload in Expo Go
- Press `r` in terminal to manually reload
- Press `m` to toggle menu

### Debugging

- Shake device or press `Ctrl+M` (Android) / `Cmd+D` (iOS) for dev menu
- Enable Remote JS Debugging or use React Native Debugger
- View console logs in terminal or browser dev tools

## Testing on Physical Devices

### Android
1. Install Expo Go from Play Store
2. Ensure phone and computer are on same Wi-Fi
3. Scan QR code from terminal

### iOS
1. Install Expo Go from App Store
2. Scan QR code with Camera app
3. Opens in Expo Go automatically

### Using IP Address
If QR code doesn't work, use your computer's local IP:
```bash
exp://192.168.1.x:8081
```

## Troubleshooting

### Common Issues

**"Network request failed"**
- Check that backend is running on port 8000
- Update API_URL to your computer's IP address (not localhost) when using physical device
- Disable VPN if connection issues persist

**"Unable to resolve module"**
- Clear cache: `npm start -- --clear`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

**Video not loading**
- Ensure video format is supported (MP4, MOV)
- Check file permissions
- Try a different video file

**Expo Go not connecting**
- Ensure both devices on same network
- Restart Expo dev server
- Update Expo Go to latest version

## Building for Production

### Development Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Create development build
eas build --profile development --platform android
```

### Production Build
```bash
# Build APK for Android
eas build --profile production --platform android

# Build for iOS (requires Apple Developer account)
eas build --profile production --platform ios
```

## Configuration

### Environment Variables

Create a `.env` file (if needed):
```env
API_URL=http://localhost:8000
API_VERSION=v1
MAX_VIDEO_SIZE=500000000
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Test on both iOS and Android
5. Commit: `git commit -am 'Add new feature'`
6. Push: `git push origin feature/new-feature`
7. Submit a pull request

## Performance Optimization

- Videos are streamed, not loaded entirely into memory
- Overlay previews use efficient rendering techniques
- Thumbnail generation for timeline scrubbing
- Lazy loading of overlay assets
- Debounced position updates while dragging

## Known Limitations

- Preview rendering is frontend-only (for demo purposes)
- Final video rendering requires backend processing
- Some video codecs may not be supported on all devices
- Large video files may take time to upload