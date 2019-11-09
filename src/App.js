/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from "react"
import { View } from "react-native";

import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createDrawerNavigator } from "react-navigation-drawer";
import { createStackNavigator } from 'react-navigation-stack';
import { createMaterialBottomTabNavigator } from "react-navigation-material-bottom-tabs";

/* SWITCH 1 */
/* Tab Navigator Components */
import RunningScreen from "./screens/Main/RunningScreen";
import { NotifiersScreen, CreateNotifierScreen } from "./screens/Main/Notifiers";
import ProfileScreen from "./screens/Main/ProfileScreen";

/* Drawer Item Components */
import TogetherScreen from "./screens/DrawerItems/TogetherScreen";
import ActivityScreen from "./screens/DrawerItems/ActivityScreen";
import StatisticsScreen from "./screens/DrawerItems/StatisticsScreen";
import SettingsScreen from "./screens/DrawerItems/SettingsScreen";
import SupportScreen from "./screens/DrawerItems/SettingsScreen";

/* SWITCH 2 */
import LoginScreen from "./screens/Auth/LoginScreen";
import RegisterScreen from "./screens/Auth/RegisterScreen";
import ForgotPassScreen from "./screens/Auth/ForgotPassScreen";

/* Custom Components */
import AppHeader from "./components/AppHeader";
import DrawerComponent from "./components/DrawerComponent";

/* TABNAVIGATOR
  {
    activeColor: '#73c9ff',
    inactiveColor: '#ffffff',
    barStyle: { backgroundColor: '#6584a6', elevation: 10 },
    shifting: true,
    tabBarPosition: "bottom"
  },
  {
    defaultNavigationOptions: ({navigation}) => ({
      header: <AppHeader navigation={navigation} />
    }),
  }
*/

const NotifiersStack = createStackNavigator({
  Notifiers: NotifiersScreen,
  CreateNotifier: CreateNotifierScreen
})

const BottomTabNavigator = createMaterialBottomTabNavigator({
  Running: RunningScreen,
  Notifiers: NotifiersStack,
  Profile: ProfileScreen
});

/* Switch 1 */
const DrawerNavigator = createDrawerNavigator({
  Tabs: BottomTabNavigator,
  Together: TogetherScreen,
  Activity: ActivityScreen,
  Statistics: StatisticsScreen,
  Settings: SettingsScreen,
  Support: SupportScreen
});

/* Switch 2 */
const AuthStack = createStackNavigator({
  Login: {
    screen: LoginScreen,
    navigationOptions: {
      header: null
    }
  },
  Register: RegisterScreen,
  ForgotPass: ForgotPassScreen
});

const SwitchNavigator = createSwitchNavigator({
  Auth: AuthStack,
  Main: DrawerNavigator
},
{
  initialRouteName: "Auth"
});

export default createAppContainer(SwitchNavigator);