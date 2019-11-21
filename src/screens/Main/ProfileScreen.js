import React, { Component } from "react"
import { Text, View, AsyncStorage } from "react-native"
import { Button } from "react-native-elements";
import * as colors from "../../media/colors";
import auth from "@react-native-firebase/auth";
import { LoginManager } from "react-native-fbsdk";
import { GoogleSignin } from "@react-native-community/google-signin";
import languages from "../../media/languages";
import CustomPicker from './../../components/CustomPicker';
import { Menu } from 'react-native-paper';

export default class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unitPickerVisible: false,
      language: languages.currentLang
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
          title={languages.currentLang.labels.signOut}
          type="solid"
          buttonStyle={{ backgroundColor: colors.dark }}
          onPress={async () => {
            new LoginManager.logOut();
            await GoogleSignin.signOut();
            await auth().signOut();
            this.props.navigation.navigate("Auth");
          }}
        />
        <CustomPicker language={this.state.language} menuOnPress={() => this.setState({ unitPickerVisible: true })} visible={this.state.unitPickerVisible} onDismiss={() => this.setState({
          unitPickerVisible: false })}>
          {languages.options.map(language => (
            <Menu.Item key={language.name} title={this.capitalize(language.name)} onPress={() => {
              AsyncStorage.setItem("sportsmartLanguage", JSON.stringify(language)).then(() => {
                languages.currentLang = language;
                this.setState({ language, unitPickerVisible: false });
              });
            }} />
          ))}
        </CustomPicker>
      </View>
    )
  }
}
