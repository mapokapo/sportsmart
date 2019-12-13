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
- [ ] Implement Notifier and Profile screens
- [ ] Add additional features in side-drawer for easy access
- [ ] Implement settings screen (dark mode, language, notification, etc.)
- [ ] Implement user search and display
- [ ] (?) Use graphs to display user stats
- [ ] Add Firebase listeners to specific distance milestones and reward users with medals
- [ ] Add automatic weekly/monthly tournaments in walking
- [x] Implement notifier with notifications (like alarm app)
- [ ] Polish app (broad) - performance, size, internet usage
- [ ] (?) Implement admin/user management system (not likely since the app is mostly fixated on individual users improving themselves, and is not a social media app)

# Screenshots from app:
![Running Screen](https://github.com/mapokapo/sportsmart-app/blob/master/src/media/screenshots/running.png?raw=true)
![Notifiers Screen](https://github.com/mapokapo/sportsmart-app/blob/master/src/media/screenshots/notifiers.png?raw=true)
![Drawer Navigator](https://github.com/mapokapo/sportsmart-app/blob/master/src/media/screenshots/drawer.png?raw=true)
![Login Screen](https://github.com/mapokapo/sportsmart-app/blob/master/src/media/screenshots/login.png?raw=true)
![Register Screen](https://github.com/mapokapo/sportsmart-app/blob/master/src/media/screenshots/register.png?raw=true)
![Reset Password Screen](https://github.com/mapokapo/sportsmart-app/blob/master/src/media/screenshots/resetpass.png?raw=true)


# How to run:
1.  `npm install`  - Install required dependencies
2.  `(optional, only if certain icons don't appear) react-native bundle --platform android --dev true --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res`  - Bundle assets (icons, images, audio)
3.  `cd android && .\gradlew clean`  - Rebuild Android Source
4.  `cd ..` - Leave Android folder
5.  `react-native link`  - Link dependencies with React Native
6.  `react-native run-android`  or  `react-native run-ios`  on iOS - Run the app on an Android Studio Emulator or a connected device with USB debugging enabled

One liner (Windows & Android): `npm i; cd android; .\gradlew clean; cd ..; react-native link; react-native run-android`
