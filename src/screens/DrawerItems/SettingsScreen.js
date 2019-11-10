import React, { Component } from "react"
import { Text, View } from "react-native"

import Icon from "react-native-vector-icons/MaterialIcons";

import AppHeader from "../../components/AppHeader";

export default class SettingsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static navigationOptions = ({ navigation, navigationOptions, screenProps }) => {
    return {
      header: <AppHeader navigation={navigation} />,
      tabBarIcon: ({ tintColor }) => (<Icon color={tintColor} type="material" name="settings" size={24} />)
    }
  }

  render() {
    return (
      <View>
        <Text> SettingsScreen </Text>
      </View>
    )
  }
}
