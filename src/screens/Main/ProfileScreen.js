import React, { Component } from "react"
import { Text, View } from "react-native"
import { Button } from "react-native-elements";
import * as colors from "../../media/colors";
import auth from "@react-native-firebase/auth";
import { LoginManager } from "react-native-fbsdk";

export default class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View>
        <Text> ProfileScreen </Text>
        <Button
          title="Sign Out"
          type="solid"
          buttonStyle={{ backgroundColor: colors.dark }}
          onPress={() => {
            new LoginManager.logOut();
            auth().signOut().then(() => {
              this.props.navigation.navigate("Auth");
            });
          }}
        />
      </View>
    )
  }
}
