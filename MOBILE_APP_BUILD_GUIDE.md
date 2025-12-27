# 📱 Mobile App Build Guide (Android & iOS)

This project has been configured with **Capacitor** to allow you to build native Android (`.apk`) and iOS (`.ipa`) apps from your existing React codebase.

Additionally, the app is already a **Progressive Web App (PWA)**, meaning users can install it directly from their browser without an app store.

---

## 🚀 Option 1: Instant PWA Install (No Build Required)

Your app is already configured as a PWA. This is the fastest way to test on mobile.

1. **Deploy** your app (e.g., to Vercel).
2. Open the URL on your mobile phone.
3. **Android (Chrome)**: Tap "Three Dots" -> "Install App".
4. **iOS (Safari)**: Tap "Share" button -> "Add to Home Screen".

---

## 🤖 Option 2: Build Android APK

We have already generated the `android` project folder for you.

### Prerequisites
- Download & Install [Android Studio](https://developer.android.com/studio).
- Ensure Java/JDK is installed.

### Steps to Build APK
1. **Open the Project**:
   - Open **Android Studio**.
   - Select **Open an existing project**.
   - Navigate to your project folder and select the `android` directory.

2. **Wait for Sync**:
   - Android Studio will spend a few minutes downloading dependencies (Gradle, SDKs). Let it finish.

3. **run the App (Emulator/Device)**:
   - Connect your Android phone via USB (Enable Developer Mode & USB Debugging).
   - Or create an AVD (Emulator) in Android Studio.
   - Click the green **Run (Play)** button in Android Studio.

4. **Generate Signed APK (For Release)**:
   - Go to **Build** -> **Generate Signed Bundle / APK**.
   - Select **APK**.
   - Create a new KeyStore (save the password!).
   - Choose `release` build variant.
   - Click **Finish**.
   - Your built `.apk` will be in `android/app/release/`.

### Updating the Code
If you make changes to your React/Vite code:
1. Run `npm run build`
2. Run `npx cap sync android`
3. Re-run or Re-build in Android Studio.

---

## 🍎 Option 3: Build iOS App

We have generated the `ios` project folder. **Note: You need a Mac with Xcode.**

### Prerequisites
- A Mac computer.
- Install **Xcode** from the App Store.
- (Optional) Apple Developer Account (for App Store submission).

### Steps to Build
1. **Open the Project**:
   - Run `npx cap open ios` in your terminal (or open `ios/App/App.xcworkspace` in Finder).

2. **Configure Signing**:
   - In Xcode, click on the **App** project on the left.
   - Go to **Signing & Capabilities**.
   - Select your "Team" (Add your Apple ID if needed).
   - Ensure "Bundle Identifier" is unique (e.g., `com.yourname.eventtix`).

3. **Run on iPhone**:
   - Connect your iPhone with a cable.
   - Select your device in the top toolbar.
   - Click the **Run (Play)** button.

4. **Archive for App Store**:
   - Go to **Product** -> **Archive**.
   - Follow the prompts to upload to TestFlight or App Store.

### Updating the Code
If you make changes to your React/Vite code:
1. Run `npm run build`
2. Run `npx cap sync ios`
3. Re-build in Xcode.

---

## 🛠 Troubleshooting

**"Android Platform already exists"**:
- This is fine. It just means the folder is there. Use `npx cap sync android` to update it.

**"Java/Gradle not found"**:
- You must install Android Studio. It comes with the necessary JDK and Gradle tools.

**White Screen on Launch**:
- Ensure your `dist` folder is up to date (`npm run build`).
- Ensure `capacitor.config.ts` has `webDir: 'dist'`.
