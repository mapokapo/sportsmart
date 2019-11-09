import React, { Component } from 'react'
import { Text, View } from 'react-native'

import Icon from "react-native-vector-icons/MaterialIcons";

class NotifiersScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View>
        <Text> Notifier Screen </Text>
      </View>
    )
  }
}

class CreateNotifierScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View>
        <Text> CreateNotifierScreen </Text>
      </View>
    )
  }
}

export {
  NotifiersScreen,
  CreateNotifierScreen
}