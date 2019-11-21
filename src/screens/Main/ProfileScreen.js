import React, { Component } from "react"
import { Text, View } from "react-native"
import { Button } from "react-native-elements";
import * as colors from "../../media/colors";
import auth from "@react-native-firebase/auth";
import { LoginManager } from "react-native-fbsdk";
import { GoogleSignin } from "@react-native-community/google-signin";

export default class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {
    GoogleSignin.configure({
      webClientId: '373206170368-e8jrbu94tgslrel2h8ar0835pkc2jl37.apps.googleusercontent.com',
      offlineAccess: true,
      forceConsentPrompt: true
    });
  }

  render() {
    return (
      <View>
        <Text> ProfileScreen </Text>
        <Button
          title="Sign Out"
          type="solid"
          buttonStyle={{ backgroundColor: colors.dark }}
          onPress={async () => {
            new LoginManager.logOut();
            await GoogleSignin.signOut();
            await auth().signOut();
            this.props.navigation.navigate("Auth");
          }}
        />
      </View>
    )
  }
}
