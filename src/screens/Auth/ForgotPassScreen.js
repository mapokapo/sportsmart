import React, { Component } from "react";
import { Text, View, StyleSheet, LayoutAnimation } from "react-native";
import * as colors from "../../media/colors";
import { TextInput } from "react-native-paper";
import { Button } from "react-native-elements";
import auth from "@react-native-firebase/auth";

export default class ForgotPassScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emailText: "",
      emailError: false,
      loading: false,
      currentError: null,
      currentTimeout: null,
      currentLang: this.props.screenProps.currentLang
    };
  }

  triggerError = (msg, duration) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({ currentError: msg }, () => {
      if (this.state.currentTimeout !== null) {
        clearTimeout(this.state.currentTimeout);
      }
      this.setState({ currentTimeout: setTimeout(this.hideError, duration*1000 | 3500) });
    });
  }

  hideError = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({ currentError: null });
  }

  emailCheck = (text) => {
    return /^\w+@\w+\.\w+$/g.test(text);
  }

  handleResetPass = () => {
    if (this.state.emailText === "") {
      this.setState({ emailError: true }, () => {
        this.triggerError(this.state.currentLang.errors.emailEmpty);
      });
      return;
    }
    if (!this.emailCheck(this.state.emailText)) {
      this.setState({ emailError: true }, () => {
        this.triggerError(this.state.currentLang.errors.emailInvalid);
      })
      return;
    }
    auth().fetchSignInMethodsForEmail(this.state.emailText).then(methods => {
      if (methods.length === 0) {
        this.setState({ emailError: true }, () => {
          this.triggerError(this.state.currentLang.errors.userNotFound);
        });
      } else if (methods.indexOf("password") === -1) {
        this.setState({ emailError: true }, () => {
          this.triggerError(this.state.currentLang.errors.facebookResetPassError, 5);
        });
      } else {
        auth().sendPasswordResetEmail(this.state.emailText);
      }
    });
  }

  render() {
    return (
      <View style={styles.mainWrapper}>
        <Text style={{ color: colors.dark, fontSize: 18 }}>{this.state.currentLang.labels.resetPassScreenText}</Text>
        <TextInput
          keyboardType="email-address"
          textContentType="emailAddress"
          error={this.state.emailError}
          style={{ marginTop: 5 }}
          mode="flat"
          label={this.state.currentLang.labels.email}
          value={this.state.emailText}
          onChangeText={text => this.setState({ emailText: text, emailError: false })}
          onFocus={() => this.setState({ emailError: false, keyboardOpened: true })}
          theme={{
            colors: {
              placeholder: colors.dark, text: colors.dark, primary: colors.dark,
              underlineColor: "transparent", background: "transparent"
            }
          }}
        />
        {this.state.currentError !== null && <Text style={styles.error}>{this.state.currentError}</Text>}
        <Button
          containerStyle={{ marginTop: "auto" }}
          titleStyle={{ color: colors.light }}
          buttonStyle={{ backgroundColor: colors.dark }}
          title={this.state.currentLang.labels.resetPass}
          type="solid"
          raised
          loading={this.state.loading}
          onPress={this.handleResetPass}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainWrapper: {
    display: "flex",
    flex: 1,
    backgroundColor: colors.light,
    paddingHorizontal: 25,
    paddingVertical: 60
  },
  error: {
    color: colors.red,
    fontSize: 16,
    textAlign: "center",
    marginBottom: "auto",
    marginTop: "auto",
    lineHeight: 15
  }
});