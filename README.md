# TrackFrame

A React Native (Expo) app for tracking visual progress over time with photos. Only supporting Android for now.


|  |  |  |
|--------|--------|--------|
| <img width="430" height="881" alt="image" src="https://github.com/user-attachments/assets/5f1f56ee-5954-474a-8c91-1997286e3c7d" /> | <img width="432" height="894" alt="image" src="https://github.com/user-attachments/assets/276ce897-23ff-418c-a2af-1caaeecbc39d" /> | <img width="424" height="880" alt="image" src="https://github.com/user-attachments/assets/fa7470a5-cc84-45d3-9f02-8dfa52433f58" /> | 

## What is it?

TrackFrame lets you create categories and add photos to them over time, so you can look back and see how far you've come. Perfect for:

- **Fitness & Gym** — Document your body transformation with regular progress shots
- **Hair Growth** — Track the effects of a new hair care product or routine over months
- **Pet Growth** — Watch your puppy, kitten, or other pet grow up week by week
- **Plant Care** — Follow a plant from seedling to full bloom
- **Recovery** — Monitor healing after surgery, injury, or illness
- **Any visual change over time** — If it changes slowly, you can track it

## Features

- Shoot or import photos, including multiple at once
- Organize into named, color-coded categories
- Gallery overview with latest photo preview per category
- Sort photos newest or oldest first; batch select to share
- Auto-detects photo date from metadata, with a manual picker as fallback
- Light, dark, or system theme
- All photos stored locally — never uploaded anywhere

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

## Tech Stack

- [Expo](https://expo.dev) / React Native
- [expo-router](https://expo.github.io/router) — file-based navigation
- [expo-image-picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/) — camera & library access
- [expo-file-system](https://docs.expo.dev/versions/latest/sdk/filesystem/) — persistent photo storage
- [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) — metadata persistence
