import React, { Component } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Keyboard, LayoutAnimation, UIManager, Image, Platform } from "react-native";
import { Button, SocialIcon } from "react-native-elements";
import { TextInput, Portal, Dialog } from "react-native-paper";
import { firebase } from "@react-native-firebase/auth";

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emailText: "",
      passText: "",
      loading: false,
      currentError: null,
      keyboardOpened: false,
      dialogText: null,
      currentTimeout: null,
      emailError: false,
      passError: false
    }

    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  _keyboardShown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({ keyboardOpened: true });
  }

  _keyboardHidden = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({ keyboardOpened: false });
  }

  componentDidMount = () => {
    Keyboard.addListener("keyboardDidShow", this._keyboardShown);
    Keyboard.addListener("keyboardDidHide", this._keyboardHidden);
  }
  
  componentWillUnmount = () => {
    Keyboard.removeListener("keyboardDidShow", this._keyboardShown);
    Keyboard.removeListener("keyboardDidHide", this._keyboardHidden);
  }

  emailCheck = (text) => {
    return /^\w+@\w+\.\w+$/g.test(text);
  }

  triggerError = (msg) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({ currentError: msg }, () => {
      if (this.state.currentTimeout !== null) {
        clearTimeout(this.state.currentTimeout);
      }
      this.setState({ currentTimeout: setTimeout(this.hideError, 3500) });
    });
  }

  hideError = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({ currentError: null });
  }

  triggerDialog = (msg) => {
    this.setState({ dialogText: msg });
  }

  hideDialog = () => {
    this.setState({ dialogText: null });
  }
  
  handleLogin = () => {
    if (this.state.emailText === "") {
      this.setState({ emailError: true }, () => {
        this.triggerError("Please fill in the email field.");
      })
      return;
    }
    if (!this.emailCheck(this.state.emailText)) {
      this.setState({ emailError: true }, () => {
        this.triggerError("Invalid email. Please try again.");
      })
      return;
    }
    if (this.state.passText === "") {
      this.setState({ passError: true }, () => {
        this.triggerError("Please fill in the password field.");
      });
      return;
    }
    this.setState({ loading: true }, () => {
      firebase.auth().signInWithEmailAndPassword(this.state.emailText, this.state.passText).then(() => {
        this.setState({ loading: false });
        this.props.navigation.navigate("App");
      }).catch(err => {
        switch(err.code) {
          case "auth/user-not-found":
            this.triggerDialog("No user corresponds to those credentials.");
            break;
          case "auth/unknown":
            this.triggerDialog("Network error. Please try again.");
            break;
          default:
            this.triggerDialog("An unhandled error has occured: \n" + err.message);
        }
        this.setState({ loading: false });
      });
    });
  }

  render() {
    return (
      <View style={styles.mainWrapper}>
        <Portal>
          <Dialog visible={this.state.dialogText !== null} onDismiss={this.hideDialog}>
            <Dialog.Title>Error</Dialog.Title>
            <Dialog.Content>
              <Text>{this.state.dialogText}</Text>
            </Dialog.Content>
          </Dialog>
        </Portal>
        {!this.state.keyboardOpened && (<View style={{ marginHorizontal: 15, flex: 4, justifyContent: "center", alignItems: "center" }}>
          <Image
            source={require("../../media/sportsmart_icons/logo.png")}
            style={{ width: 225, height: 225 }}
          />
        </View>)}
          <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
            <TouchableOpacity>
              <SocialIcon type="google" raised color={colors.dark} style={{ marginTop: 20, width: this.state.keyboardOpened ? 48 : 32, height: this.state.keyboardOpened ? 48 : 32 }} iconSize={this.state.keyboardOpened ? 24 : 16} />
            </TouchableOpacity>
            <TouchableOpacity>
              <SocialIcon type="facebook" raised color={colors.dark} style={{ marginTop: 20, width: this.state.keyboardOpened ? 48 : 32, height: this.state.keyboardOpened ? 48 : 32 }} iconSize={this.state.keyboardOpened ? 24 : 16} />
            </TouchableOpacity>
          </View>
        <View style={{ display: "flex", flex: 3, paddingTop: 15, paddingTop: 15, justifyContent: "center", backgroundColor: colors.light, borderTopRightRadius: this.state.keyboardOpened ? 0 : 25, borderTopLeftRadius: this.state.keyboardOpened ? 0 : 25 }}>
          <View style={{ marginHorizontal: 15, flex: 5, display: "flex", justifyContent: "center" }}>
            <TextInput
              autoCapitalize="none"
              textContentType="emailAddress"
              error={this.state.emailError}
              style={{ marginBottom: 5 }}
              mode="outlined"
              label="Email"
              value={this.state.emailText}
              onChangeText={text => this.setState({ emailText: text, emailError: false })}
              onFocus={() => this.setState({ emailError: false, keyboardOpened: true }, () => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
              })}
              theme={{
                colors: {
                  placeholder: colors.dark, text: colors.dark, primary: colors.dark,
                  underlineColor: "transparent", background: colors.light
                }
            }}
            />
            <TextInput
              autoCapitalize="none"
              textContentType="password"
              secureTextEntry={true}
              autoCorrect={false}
              error={this.state.passError}
              style={styles.textInput}
              mode="outlined"
              label="Password"
              value={this.state.passText}
              onChangeText={text => this.setState({ passText: text, passError: false })}
              onFocus={() => this.setState({ passError: false, keyboardOpened: true }, () => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
              })}
              theme={{
                colors: {
                  placeholder: colors.dark, text: colors.dark, primary: colors.dark,
                  underlineColor: "transparent", background: colors.light
                }
              }}
            />
            <View style={{ display: "flex", justifyContent: "space-around", alignItems: "center", flexDirection: "row" }}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("Register")}><Text style={{ color: colors.blue, marginTop: -1, fontSize: 16 }}>Don't have an account?</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("ForgotPass")}><Text style={{ color: colors.blue, marginTop: -1, fontSize: 16 }}>Forgot your password?</Text></TouchableOpacity>
            </View>
          </View>
          {this.state.currentError !== null && <Text style={styles.error}>{this.state.currentError}</Text>}
          <View style={{ marginHorizontal: 15, flex: 2 }}>
            <Button
              titleStyle={{ color: colors.light }}
              buttonStyle={{ backgroundColor: colors.red }}
              containerStyle={{ marginTop: "auto", marginBottom: "auto" }}
              title="Login"
              type="solid"
              raised
              loading={this.state.loading}
              onPress={this.handleLogin}
            />
          </View>
        </View>
      </View>
    )
  }
}

import * as colors from "../../media/colors";

const styles = StyleSheet.create({
  mainWrapper: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.dark
  },
  textInput: {
    marginBottom: 5
  },
  error: {
    color: colors.red,
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 15
  }
});