# sportsmart
A modern fitness App

~*The smart way to be active*

# Info about this project:
- Made with React Native in Android
- Uses Firebase for authentication, storage, data management, and more
- Uses Google Maps for tracking
- Compatible with Google and Facebook accounts

This app tracks your step count, walking distance, calories/fat burned, weight lost, shows your recent and long-term activity, provides in-depth statistics about your account, provides customisable profiles and weekly/monthly tournaments in body activity.

# TODO:
- [x] Track user distance, step count, weight lost, etc. using distance traveled with Google Maps
- [x] Implement Notifier and Profile screens
- [x] Add additional features in side-drawer for easy access
- [x] Implement settings screen (language, notification, etc.)
- [x] Implement user search and display
- [x] (?) Use graphs to display user stats
- [x] Add Firebase listeners to specific distance milestones and reward users with medals
- [x] Implement notifier with notifications (like alarm app)
- [x] Polish app (broad) - performance, size, internet usage

# Screenshots from app:
<img alt="Running Screen" src="https://github.com/mapokapo/sportsmart-app/blob/master/src/media/screenshots/running.png?raw=true" width="270" height="480" /> <img alt="Notifiers Screen" src="https://github.com/mapokapo/sportsmart-app/blob/master/src/media/screenshots/notifiers.png?raw=true" width="270" height="480" /> <img alt="Drawer Navigator" src="https://github.com/mapokapo/sportsmart-app/blob/master/src/media/screenshots/drawer.png?raw=true" width="270" height="480" /> <img alt="Login Screen" src="https://github.com/mapokapo/sportsmart-app/blob/master/src/media/screenshots/login.png?raw=true" width="270" height="480" /> <img alt="Register Screen" src="https://github.com/mapokapo/sportsmart-app/blob/master/src/media/screenshots/register.png?raw=true" width="270" height="480" /> <img alt="Reset Password Screen" src="https://github.com/mapokapo/sportsmart-app/blob/master/src/media/screenshots/resetpass.png?raw=true" width="270" height="480" />


# How to run:
1.  `npm install`  - Install required dependencies
2.  `(optional, only if certain icons don't appear) react-native bundle --platform android --dev true --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res`  - Bundle assets (icons, images, audio)
3.  `cd android && .\gradlew clean`  - Rebuild Android Source
4.  `cd ..` - Leave Android folder
5.  `react-native link`  - Link dependencies with React Native
6.  `react-native run-android`  or  `react-native run-ios`  on iOS - Run the app on an Android Studio Emulator or a connected device with USB debugging enabled

One liner (Windows & Android): `npm i; cd android; .\gradlew clean; cd ..; react-native link; react-native run-android`
