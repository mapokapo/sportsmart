/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from "react";
import { AsyncStorage, Text, LayoutAnimation, UIManager } from "react-native";

import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createDrawerNavigator } from "react-navigation-drawer";
import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";

/* Tab Navigator Components */
import RunningScreen from "./screens/Main/RunningScreen";
import { NotifiersScreen, CreateNotifierScreen } from "./screens/Main/Notifiers";
import ProfileScreen from "./screens/Main/ProfileScreen";

/* Drawer Item Components */
import TogetherScreen from "./screens/DrawerItems/TogetherScreen";
import ActivityScreen from "./screens/DrawerItems/ActivityScreen";
import StatisticsScreen from "./screens/DrawerItems/StatisticsScreen";
import SettingsScreen from "./screens/DrawerItems/SettingsScreen";
import SupportScreen from "./screens/DrawerItems/SupportScreen";

/* SWITCH 2 */
import LoadingScreen from "./screens/Auth/LoadingScreen";
import LoginScreen from "./screens/Auth/LoginScreen";
import RegisterScreen from "./screens/Auth/RegisterScreen";
import ForgotPassScreen from "./screens/Auth/ForgotPassScreen";

/* Custom Components */
import AppHeader from "./components/AppHeader";
import DrawerComponent from "./components/DrawerComponent";
import * as colors from "./media/colors";
import { Icon } from "react-native-elements";
import languages from "./media/languages";
AsyncStorage.getItem("sportsmartLanguage").then(result => {
  if (result) languages.currentLang = JSON.parse(result);
});

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
}

const NotifiersStack = createStackNavigator({
  Notifiers: {
    screen: NotifiersScreen
  },
  CreateNotifier: {
    screen: CreateNotifierScreen
  }
}, {
  headerMode: "none",
  navigationOptions: {
    header: null
  }
});

const BottomTabNavigator = createStackNavigator({
  TabsStack: createBottomTabNavigator({
    Running: {
      screen: RunningScreen,
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => (<Icon type="material-community" name="run" color={tintColor} size={24} />),
        tabBarLabel: ({ focused, tintColor }) => <Text style={{ textAlign: "center", color: tintColor, height: focused ? "auto" : 0 }}>{languages.currentLang.labels.running}</Text>,
        tabBarOnPress: ({ defaultHandler }) => { defaultHandler(); LayoutAnimation.configureNext(LayoutAnimation.create(50, LayoutAnimation.Types.linear, LayoutAnimation.Properties.opacity)); }
      })
    },
    Notifiers: {
      screen: NotifiersStack,
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => (<Icon type="material-community" name="alarm" color={tintColor} size={24} />),
        tabBarLabel: ({ focused, tintColor }) => <Text style={{ textAlign: "center", color: tintColor, height: focused ? "auto" : 0 }}>{languages.currentLang.labels.notifiers}</Text>,
        tabBarOnPress: ({ defaultHandler }) => { defaultHandler(); LayoutAnimation.configureNext(LayoutAnimation.create(50, LayoutAnimation.Types.linear, LayoutAnimation.Properties.opacity)); }
      })
    },
    Profile: {
      screen: ProfileScreen,
      navigationOptions: () => ({
        tabBarIcon: ({ tintColor }) => (<Icon type="material-community" name="account" color={tintColor} size={24} />),
        tabBarLabel: ({ focused, tintColor }) => <Text style={{ textAlign: "center", color: tintColor, height: focused ? "auto" : 0 }}>{languages.currentLang.labels.profile}</Text>,
        tabBarOnPress: ({ defaultHandler }) => { defaultHandler(); LayoutAnimation.configureNext(LayoutAnimation.create(50, LayoutAnimation.Types.linear, LayoutAnimation.Properties.opacity)); }
      })
    }
  }, {
    initialRouteName: "Running",
    tabBarOptions: {
      activeTintColor: colors.red,
      inactiveTintColor: colors.light,
      style: {
        backgroundColor: colors.dark,
        elevation: 2
      }
    }
  })
}, {
  defaultNavigationOptions: ({ navigation }) => ({
    header: <AppHeader navigation={navigation} />
  })
});

/* Switch 1 */
const DrawerNavigator = createDrawerNavigator({
  Tabs: BottomTabNavigator,
  Together: TogetherScreen,
  Activity: ActivityScreen,
  Statistics: StatisticsScreen,
  Settings: SettingsScreen,
  Support: SupportScreen
}, {
  contentComponent: DrawerComponent
  ,
  initialRouteName: "Tabs"
});

/* Switch 2 */
const AuthStack = createStackNavigator({
  Login: {
    screen: LoginScreen,
    navigationOptions: {
      header: null
    }
  },
  Register: {
    screen: RegisterScreen,
    navigationOptions: () => ({
      headerTintColor: colors.light,
      headerStyle: {
        backgroundColor: colors.dark
      },
      headerTitle: languages.currentLang.labels.register
    })
  },
  ForgotPass: {
    screen: ForgotPassScreen,
    navigationOptions: () => ({
      headerTintColor: colors.light,
      headerStyle: {
        backgroundColor: colors.dark
      },
      headerTitle: languages.currentLang.labels.resetPass
    })
  }
}, {
  initialRouteName: "Login"
});

const AppSwitchNavigator = createSwitchNavigator({
  Loading: LoadingScreen,
  Auth: AuthStack,
  App: DrawerNavigator
},
{
  initialRouteName: "Loading"
});

export default createAppContainer(AppSwitchNavigator);