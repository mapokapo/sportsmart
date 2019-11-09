import React, { Component } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Keyboard } from "react-native";
import { Image, Button } from "react-native-elements";
import { TextInput } from "react-native-paper";

export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emailText: "",
      passText: "",
      loading: false,
      currentError: null,
      errorVisible: false,
      keyboardOpened: false
    }
  }

  _keyboardShown = () => {
    this.setState({ keyboardOpened: true });
  }

  _keyboardHidden = () => {
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

  emailCheck = (text) => new Promise((resolve, reject) => {
    console.log(text)
    if (/^\w+@\w+\.\w+$/g.test(text)) {
      resolve();
    } else {
      reject("Email is not valid.");
    }
  })

  passwordCheck = (text) => new Promise((resolve, reject) => {
    if (text.length >= 8) {
      if (/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/g.test(text)) {
        resolve();
      } else {
        reject("Password must include at least one letter, one symbol, and one number");
      }
    } else {
      reject("Password must be at least 8 characters long");
    }
  })

  triggerError = (msg) => {
    this.setState({ currentError: msg, errorVisible: true }, () => {
      setTimeout(this.hideError, 3500);
    });
  }

  hideError = () => {
    this.setState({ errorVisible: false });
  }
  
  handleLogin = () => {
    this.setState({ loading: true }, () => {
      this.emailCheck(this.state.emailText).then(() => {
        this.passwordCheck(this.state.passText).then(() => {
          console.log("lag in");
          this.setState({ loading: false });
        }).catch(msg => {
          this.triggerError(msg);
          this.setState({ loading: false, passError: true });
        })
      }).catch(msg => {
        this.triggerError(msg);
        this.setState({ loading: false, emailError: true });
      });
    })
  }

  render() {
    return (
      <View style={styles.mainWrapper}>
        <View style={{ display: "flex", flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Image
            source={require("../../media/sportsmart_icons/logo.png")}
            style={{ width: 200, height: 200 }}
          />
        </View>
        <View style={{ marginHorizontal: 15, display: "flex", flex: 1, justifyContent: "center" }}>
          <View style={{ flex: 3, display: "flex", justifyContent: "center" }}>
            <TextInput
              style={styles.textInput}
              error={this.state.emailError}
              mode="outlined"
              label="Email"
              value={this.state.emailText}
              onChangeText={text => this.setState({ emailText: text, emailError: false })}
              onFocus={() => this.setState({ emailError: false })}
              theme={{
                colors: {
                  placeholder: "#D8E8F0", text: "#ecf0f1", primary: "#D8E8F0",
                  underlineColor: "transparent", background: "#33425B"
                }
             }}
            />
            <TextInput
              style={styles.textInput}
              error={this.state.passError}
              mode="outlined"
              label="Password"
              value={this.state.passText}
              onChangeText={text => this.setState({ passText: text, passError: false })}
              onFocus={() => this.setState({ passError: false })}
              theme={{
                colors: {
                  placeholder: "#D8E8F0", text: "#ecf0f1", primary: "#D8E8F0",
                  underlineColor: "transparent", background: "#33425B"
                }
             }}
            />
            {!this.state.keyboardOpened && (<View style={{ display: "flex", justifyContent: "space-around", alignItems: "center", flexDirection: "row" }}>
              <TouchableOpacity><Text style={{ color: "#3498db", marginTop: -1 }}>Don't have an account?</Text></TouchableOpacity>
              <TouchableOpacity><Text style={{ color: "#3498db", marginTop: -1 }}>Forgot your password?</Text></TouchableOpacity>
            </View>)}
          </View>
          {this.state.errorVisible && <Text style={styles.error}>{this.state.currentError}</Text>}
          <View style={{ flex: 1 }}>
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
  modal: {
    display: "flex",
    alignItems: "center",
    paddingVertical: 12
  },
  modalText: {
    fontSize: 24,
    textAlign: "center"
  },
  textInput: {
    marginBottom: 5
  },
  error: {
    color: "#d42f2f",
    fontSize: 16,
    textAlign: "center"
  }
});