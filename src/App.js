/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from "react"

import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createDrawerNavigator } from "react-navigation-drawer";
import { createStackNavigator } from "react-navigation-stack";
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

/* TABNAVIGATOR
  {
    activeColor: "#73c9ff",
    inactiveColor: "#ffffff",
    barStyle: { backgroundColor: "#6584a6", elevation: 10 },
    shifting: true,
    tabBarPosition: "bottom"
  },
  {
    defaultNavigationOptions: ({navigation}) => ({
      header: <AppHeader navigation={navigation} />
    }),
  }
*/

const RunningStack = createStackNavigator({
  Running: {
    screen: RunningScreen,
    navigationOptions: ({ navigation }) => {
      return {
        header: <AppHeader navigation={navigation} />
      };
    }
  }
});

const NotifiersStack = createStackNavigator({
  Notifiers: {
    screen: NotifiersScreen,
    navigationOptions: ({ navigation }) => {
      return {
        header: <AppHeader navigation={navigation} />
      };
    }
  },
  CreateNotifier: {
    screen: CreateNotifierScreen,
    navigationOptions: ({ navigation }) => {
      return {
        header: <AppHeader navigation={navigation} />
      };
    }
  }
});

const ProfileStack = createStackNavigator({
  Profile: {
    screen: ProfileScreen,
    navigationOptions: ({ navigation }) => {
      return {
        header: <AppHeader navigation={navigation} />
      };
    }
  }
});

const BottomTabNavigator = createMaterialBottomTabNavigator({
  Running: {
    screen: RunningStack,
    navigationOptions: {
      tabBarIcon: ({ focused, horizontal, tintColor }) => (<Icon type="material-community" name="run" color={tintColor} size={24} />),
      tabBarBadge: true
    }
  },
  Notifiers: {
    screen: NotifiersStack,
    navigationOptions: {
      tabBarIcon: ({ focused, horizontal, tintColor }) => (<Icon type="material-community" name="alarm" color={tintColor} size={24} />)
    }
  },
  Profile: {
    screen: ProfileStack,
    navigationOptions: {
      tabBarIcon: ({ focused, horizontal, tintColor }) => (<Icon type="material-community" name="account" color={tintColor} size={24} />)
    }
  }
}, {
  shifting: true,
  barStyle: {
    backgroundColor: colors.dark
  },
  activeColor: colors.red,
  inactiveColor: colors.light
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
});

/* Switch 2 */
const AuthStack = createStackNavigator({
  Loading: {
    screen: LoadingScreen,
    navigationOptions: {
      header: null
    }
  },
  Login: {
    screen: LoginScreen,
    navigationOptions: {
      header: null
    }
  },
  Register: {
    screen: RegisterScreen,
    navigationOptions: {
      headerTintColor: colors.light,
      headerStyle: {
        backgroundColor: colors.dark
      }
    }
  },
  ForgotPass: ForgotPassScreen,
  initialRouteName: "Loading"
});

const SwitchNavigator = createSwitchNavigator({
  Auth: AuthStack,
  Main: DrawerNavigator
},
{
  initialRouteName: "Auth"
});

export default createAppContainer(SwitchNavigator);