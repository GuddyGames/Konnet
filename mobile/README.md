# Konnet Mobile

This is the native mobile application for Android and iOS. It is separate from the existing Vite web client and shares the Supabase backend.

## Stack

- Expo SDK 58
- React Native 0.88
- Supabase Auth and database
- AsyncStorage-backed session persistence
- EAS Build for Android and iOS

## Configuration

Copy `.env.example` to `.env` and add the existing Supabase project URL and anon key. Never add a service-role key to the app.

Required variables:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Run locally

From this directory, install dependencies and run the Expo development server. Use Expo Go or a development build to open the app.

## Build

Configure an Expo account and EAS project, then use the development, preview, and production profiles in `eas.json`.

The first mobile foundation includes username/password authentication, profile onboarding, session persistence, and a native dashboard shell. Social features will be migrated screen by screen to native components and Supabase queries.