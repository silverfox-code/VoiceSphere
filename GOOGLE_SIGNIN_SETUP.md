# Google Sign-In Configuration Guide

## ✅ What We Set Up

We've created a proper, production-ready way to handle your Google Web Client ID using Android's BuildConfig system.

### Files Created/Modified:

1. **android/app/build.gradle** - Added BuildConfig field for WEB_CLIENT_ID
2. **android/app/src/main/java/com/voicesphere/GoogleConfigModule.kt** - Native module to expose the ID
3. **android/app/src/main/java/com/voicesphere/GoogleConfigPackage.kt** - Package registration
4. **android/app/src/main/java/com/voicesphere/MainApplication.kt** - Registered the package
5. **src/screens/Auth/Home/HomeScreen.tsx** - Updated to use the native module

## 🔧 What You Need To Do

### Step 1: Get Your Web Client ID

1. Open `android/app/google-services.json` in your editor
2. Find the section with `"oauth_client"`
3. Look for an entry where `"client_type": 3` (this is the Web Client)
4. Copy the `"client_id"` value (it will look like: `xxxxx.apps.googleusercontent.com`)

### Step 2: Update build.gradle

1. Open `android/app/build.gradle`
2. Find line 86 (around there) which has:
   ```gradle
   buildConfigField "String", "WEB_CLIENT_ID", "\"YOUR_WEB_CLIENT_ID.apps.googleusercontent.com\""
   ```
3. **Replace** `YOUR_WEB_CLIENT_ID.apps.googleusercontent.com` with your actual Web Client ID
4. Save the file

### Step 3: Rebuild the App

Run these commands:
```bash
# Clean the build
cd android
./gradlew clean
cd ..

# Rebuild and run
npm run android
```

## ✨ Why This Is Better

**Before:** Trying to read google-services.json at runtime (doesn't work in React Native)  
**After:** Using Android's BuildConfig system (proper native way)

**Benefits:**
- ✅ Secure - ID is compiled into the app
- ✅ Native - Uses Android's standard BuildConfig
- ✅ Type-safe - Exposed through a proper native module
- ✅ Production-ready - Can have different IDs for debug/release builds

## 🔍 Troubleshooting

If you still see the error after updating:
1. Make sure you replaced the placeholder in **build.gradle**
2. Run `cd android && ./gradlew clean` to clean the build
3. Restart Metro bundler: `npx react-native start --reset-cache`
4. Rebuild the app: `npm run android`

## 📝 Example

If your Web Client ID is: `123456789-abc.apps.googleusercontent.com`

Your build.gradle should look like:
```gradle
buildConfigField "String", "WEB_CLIENT_ID", "\"123456789-abc.apps.googleusercontent.com\""
```

**Note:** Keep the quotes and backslashes exactly as shown!
