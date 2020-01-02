/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from "react";
import { Text, StatusBar } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";

import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createDrawerNavigator } from "react-navigation-drawer";
import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";

/* Tab Navigator Components */
import RunningScreen from "./screens/Main/RunningScreen";
import NotifiersScreen from "./screens/Main/Notifiers";
import ProfileScreen from "./screens/Main/ProfileScreen";

/* Drawer Item Components */
import TogetherScreen from "./screens/DrawerItems/TogetherScreen";
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
import localization from "./media/languages";

const BottomTabNavigator = createStackNavigator({
  TabsStack: createBottomTabNavigator({
    Running: {
      screen: RunningScreen,
      navigationOptions: ({ screenProps }) => ({
        tabBarIcon: ({ tintColor }) => (<Icon type="material-community" name="run" color={tintColor} size={24} />),
        tabBarLabel: ({ focused, tintColor }) => <Text style={{ textAlign: "center", color: tintColor, height: focused ? "auto" : 0 }}>{screenProps.currentLang.labels.running}</Text>
      })
    },
    Notifiers: {
      screen: NotifiersScreen,
      navigationOptions: ({ screenProps }) => ({
        tabBarIcon: ({ tintColor }) => (<Icon type="material-community" name="alarm" color={tintColor} size={24} />),
        tabBarLabel: ({ focused, tintColor }) => <Text style={{ textAlign: "center", color: tintColor, height: focused ? "auto" : 0 }}>{screenProps.currentLang.labels.notifiers}</Text>
      })
    },
    Profile: {
      screen: ProfileScreen,
      navigationOptions: ({ screenProps }) => ({
        tabBarIcon: ({ tintColor }) => (<Icon type="material-community" name="account" color={tintColor} size={24} />),
        tabBarLabel: ({ focused, tintColor }) => <Text style={{ textAlign: "center", color: tintColor, height: focused ? "auto" : 0 }}>{screenProps.currentLang.labels.profile}</Text>
      })
    }
  }, {
    initialRouteName: "Running",
    tabBarOptions: {
      keyboardHidesTabBar: true,
      activeTintColor: colors.red,
      inactiveTintColor: colors.light,
      style: {
        backgroundColor: colors.dark,
        elevation: 2
      }
    }
  })
}, {
  defaultNavigationOptions: ({ navigation, screenProps }) => ({
    header: <AppHeader navigation={navigation} screenProps={screenProps} />
  })
});

/* Switch 1 */
const DrawerNavigator = createDrawerNavigator({
  Tabs: BottomTabNavigator,
  Together: TogetherScreen,
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
    navigationOptions: ({ screenProps }) => ({
      headerTintColor: colors.light,
      headerStyle: {
        backgroundColor: colors.dark
      },
      headerTitle: screenProps.currentLang.labels.register
    })
  },
  ForgotPass: {
    screen: ForgotPassScreen,
    navigationOptions: ({ navigation, screenProps }) => ({
      headerTintColor: colors.light,
      headerStyle: {
        backgroundColor: colors.dark
      },
      headerTitle: screenProps.currentLang.labels.resetPass,
      headerLeft: <Icon name="arrow-back" color={colors.light} size={24} containerStyle={{ marginLeft: 15 }} onPress={ () => {
        if (navigation.state.params && navigation.state.params.from === "settings") {
          navigation.navigate("Settings");
        } else {
          navigation.goBack();
        }
      } }  />
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

let AppContainer = createAppContainer(AppSwitchNavigator);

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      languages: localization.languages,
      currentLang: localization.currentLang
    }
  }

  componentDidMount = () => {
    AsyncStorage.getItem("sportsmartLanguage").then(item => {
      if (item) {
        this.setState({ currentLang: JSON.parse(item) });
      }
    });
  }

  changeLanguage = (langStr, callback) => {
    this.state.languages.forEach(lang => {
      if (langStr === lang.name) {
        this.setState({ currentLang: lang }, () => {
          if (callback) callback();
          AsyncStorage.setItem("sportsmartLanguage", JSON.stringify(lang));
        });
      }
    })
  }

  render() {
    return (
      <>
        <StatusBar backgroundColor={colors.dark} barStyle="light-content" />
        <AppContainer screenProps={{ languages: this.state.languages, currentLang: this.state.currentLang, changeLanguage: this.changeLanguage }} />
      </>
    )
  }
}