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
- Track user distance, step count, weight lost, etc. using distance traveled with Google Maps
- Implement Notifier and Profile screens
- Add additional features in side-drawer for easy access
- Implement settings screen
- (?) Use graphs to display user stats
- Add Firebase listeners to specific distance milestones and reward users with medals
- Add automatic weekly/monthly tournaments in walking
- Implement notifier with notifications (like alarm app)
- Polish app (broad) - performance, size, internet usage
- (?) Implement admin/user management system (not likely since the app is mostly fixated on individual users improving themselves, and is not a social media app)

# Screenshots from app:
\*\***COMING SOON****

# How to run:
1.  `npm install`  - Install required dependencies
2.  `cd android && .\gradlew clean`  - Rebuild Android Source
3.  `cd ..` - Leave Android folder
4.  `react-native link`  - Link dependencies with React Native
5.  `react-native run-android`  or  `react-native run-ios`  on iOS - Run the app on an Android Studio Emulator or a connected device with USB debugging enabled

One liner (Windows & Android): `npm i; cd android; .\gradlew clean; cd ..; react-native link; react-native run-android`
