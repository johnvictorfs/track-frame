# TrackFrame

A React Native (Expo) app for tracking visual progress over time with photos.

## What is it?

TrackFrame lets you create categories and add photos to them over time, so you can look back and see how far you've come. Perfect for:

- **Fitness & Gym** — Document your body transformation with regular progress shots
- **Hair Growth** — Track the effects of a new hair care product or routine over months
- **Pet Growth** — Watch your puppy, kitten, or other pet grow up week by week
- **Plant Care** — Follow a plant from seedling to full bloom
- **Recovery** — Monitor healing after surgery, injury, or illness
- **Any visual change over time** — If it changes slowly, you can track it

## Features

- Take photos with your camera or import from your photo library
- Organize photos into named, color-coded categories
- See all categories at a glance with latest photo preview and count
- Browse a chronological photo grid per category
- Long-press a photo to delete it
- Add more photos to any category at any time
- Dark mode support

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app:
   ```bash
   npm start
   ```

   Then open in the [Expo Go](https://expo.dev/go) app, an Android emulator, or iOS simulator.

## Project Structure

```
app/
  (tabs)/
    index.tsx       # Gallery — categories list
    add.tsx         # Add Photo — pick/shoot and categorize
  category/
    [id].tsx        # Category detail — chronological photo grid
context/
  photos-context.tsx  # Shared state: categories and photos
```

## Tech Stack

- [Expo](https://expo.dev) / React Native
- [expo-router](https://expo.github.io/router) — file-based navigation
- [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) — camera & library access
- [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/) — persistent photo storage
- [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) — metadata persistence
