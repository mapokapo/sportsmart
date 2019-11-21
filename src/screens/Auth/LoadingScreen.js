import React, { Component } from "react";
import { View, ActivityIndicator, StatusBar } from "react-native";
import * as colors from "../../media/colors";
import auth from "@react-native-firebase/auth";

export default class LoadingScreen extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    this.unsub = auth().onAuthStateChanged(user => {
      this.props.navigation.navigate(user ? "App" : "Auth");
    });
  }

  componentWillUnmount = () => {
    this.unsub();
  }

  render() {
    return (
      <View style={{ display: "flex", flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.dark }}>
        <StatusBar hidden={true} />
        <ActivityIndicator size="large" color={colors.light} />
      </View>
    )
  }
}
