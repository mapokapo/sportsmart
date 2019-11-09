import React, { Component } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Keyboard, LayoutAnimation, UIManager, Image, Platform } from "react-native";
import { Button, Icon } from "react-native-elements";
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
      currentTimeout: null
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

  /*passwordCheck = (text) => new Promise((resolve, reject) => {
    if (text.length >= 8) {
      if (/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/g.test(text)) {
        resolve();
      } else {
        reject("Password must include at least one letter, one symbol, and one number");
      }
    } else {
      reject("Password must be at least 8 characters long");
    }
  })*/

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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({ loading: true }, () => {
      firebase.auth().signInWithEmailAndPassword(this.state.emailText, this.state.passText).then(() => {
        this.setState({ loading: false });
        this.props.navigation.navigate("Main");
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
        this.setState({ loading: false })
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
        <View style={{ display: "flex", flex: 3, paddingTop: 15, paddingTop: 15, justifyContent: "center", backgroundColor: "#D8E8F0", borderTopRightRadius: this.state.keyboardOpened ? 0 : 25, borderTopLeftRadius: this.state.keyboardOpened ? 0 : 25 }}>
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
                  placeholder: "#33425B", text: "#33425B", primary: "#33425B",
                  underlineColor: "transparent", background: "#D8E8F0"
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
                  placeholder: "#33425B", text: "#33425B", primary: "#33425B",
                  underlineColor: "transparent", background: "#D8E8F0"
                }
             }}
            />
            <View style={{ display: "flex", justifyContent: "space-around", alignItems: "center", flexDirection: "row" }}>
              <TouchableOpacity><Text style={{ color: "#3498db", marginTop: -1 }}>Don't have an account?</Text></TouchableOpacity>
              <TouchableOpacity><Text style={{ color: "#3498db", marginTop: -1 }}>Forgot your password?</Text></TouchableOpacity>
            </View>
          </View>
          {this.state.currentError !== null && <Text style={styles.error}>{this.state.currentError}</Text>}
          <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
            <TouchableOpacity>
              <Icon name="google" type="font-awesome" color="#33425B" size={24} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name="facebook" type="font-awesome" color="#33425B" size={24} />
            </TouchableOpacity>
          </View>
          <View style={{ marginHorizontal: 15, flex: 2 }}>
            <Button
              titleStyle={{ color: "#D8E8F0" }}
              buttonStyle={{ backgroundColor: "#F33535" }}
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

const styles = StyleSheet.create({
  mainWrapper: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#33425B"
  },
  textInput: {
    marginBottom: 5
  },
  error: {
    color: "#d42f2f",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 15
  }
});