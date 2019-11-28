import React, { Component } from "react"
import { Text, View, Picker } from "react-native"
import { Button } from "react-native-elements";
import * as colors from "../../media/colors";
import auth from "@react-native-firebase/auth";
import { LoginManager } from "react-native-fbsdk";
import { GoogleSignin } from "@react-native-community/google-signin";

export default class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unitPickerVisible: false
    };
  }

  componentDidMount = () => {
    GoogleSignin.configure({
      webClientId: '373206170368-e8jrbu94tgslrel2h8ar0835pkc2jl37.apps.googleusercontent.com',
      offlineAccess: true,
      forceConsentPrompt: true
    });
  }

  capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  render() {
    return (
      <View>
        <Text> ProfileScreen </Text>
        <Button
          title={this.props.screenProps.currentLang.labels.signOut}
          type="solid"
          buttonStyle={{ backgroundColor: colors.dark }}
          onPress={async () => {
            new LoginManager.logOut();
            await GoogleSignin.signOut();
            await auth().signOut();
            this.props.navigation.navigate("Auth");
          }}
        />
        <Picker
          mode="dropdown"
          selectedValue={this.props.screenProps.currentLang.name}
          onValueChange={(itemValue) => {
            this.props.screenProps.changeLanguage(itemValue);
          }}>
          {this.props.screenProps.languages.map((lang, index) => (
            <Picker.Item key={index} label={this.capitalize(lang.name)} value={lang.name} />
          ))}
        </Picker>
      </View>
    )
  }
}
