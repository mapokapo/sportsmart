import React, { Component } from "react";
import { Text, View, StyleSheet, Keyboard, LayoutAnimation, UIManager, ScrollView, ToastAndroid } from "react-native";
import AppHeader from "../../components/AppHeader";
import * as colors from "../../media/colors";
import { TextInput } from "react-native-paper";
import { Button } from "react-native-elements";
import functions from "@react-native-firebase/functions";
import auth from "@react-native-firebase/auth";

export default class SupportScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keyboardOpened: false,
      title: "",
      desc: "",
      currentTimeout: null,
      currentErrorTimeout: null,
      currentError: null,
      titleError: false,
      descError: false
    }

    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    this.desc = React.createRef();
  }

  _keyboardShown = () => {
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
    if (this.unsubscribe) this.unsubscribe();
    Keyboard.removeListener("keyboardDidShow", this._keyboardShown);
    Keyboard.removeListener("keyboardDidHide", this._keyboardHidden);
  }

  triggerError = (msg) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({ currentError: msg }, () => {
      if (this.state.currentErrorTimeout !== null) {
        clearTimeout(this.state.currentErrorTimeout);
      }
      this.setState({ currentErrorTimeout: setTimeout(this.hideError, 3500) });
    });
  }

  hideError = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({ currentError: null });
  }

  checkTitle = () => {
    return this.state.title !== "";
  }

  checkDesc = () => {
    return this.state.desc !== "";
  }

  handleReport = () => {
    if (this.state.currentTimeout === null) {
      this.setState({ currentTimeout: setTimeout(() => this.setState({ currentTimeout: null }), 15000) }, () => {
        this.unsubscribe = auth().onAuthStateChanged(user => {
          if (user) {
            if (!this.checkTitle()) {
              this.setState({ titleError: true }, () => {
                this.triggerError(this.props.screenProps.currentLang.errors.titleEmptyError);
              });
              return;
            }
            if (!this.checkDesc()) {
              this.setState({ descError: true }, () => {
                this.triggerError(this.props.screenProps.currentLang.errors.descEmptyError);
              });
              return;
            }
            functions().httpsCallable("sendMail")({
              lang: this.props.screenProps.currentLang.name === "hrvatski" ? "hr" : "en",
              dest: user.email,
              reportData: {
                title: this.state.title,
                desc: this.state.desc
              }
            }).then(() => {
              ToastAndroid.show(this.props.screenProps.currentLang.labels.supportSubmit, ToastAndroid.LONG)
            }).catch(err => console.log(err));
          }
        });
      });
    }
  }

  render() {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} style={styles.mainWrapper}>
        <AppHeader navigation={this.props.navigation} screenProps={this.props.screenProps} />
        <View style={{ flex: 1, paddingHorizontal: 25, paddingVertical: 60, paddingTop: 45 }}>
          <Text style={{ color: colors.dark, fontSize: 18, textAlign: "center", marginBottom: 30 }}>{this.props.screenProps.currentLang.labels.supportText}</Text>
          <TextInput
            onFocus={() => {
              this.setState({ keyboardOpened: true, titleError: false });
            }}
            onBlur={() => {
              this.setState({ keyboardOpened: false });
            }}
            style={{ marginTop: 5 }}
            mode="flat"
            value={this.state.title}
            onChangeText={text => this.setState({ title: text, titleError: false })}
            onSubmitEditing={() => this.desc.current.focus()}
            error={this.state.titleError}
            label={this.props.screenProps.currentLang.labels.supportTitle}
            returnKeyType="next"
            theme={{
              colors: {
                placeholder: "rgba(51, 66, 91, 0.85)", text: colors.dark, primary: colors.dark,
                underlineColor: "transparent", background: "transparent"
              }
            }}
          />
          <TextInput
            ref={this.desc}
            onFocus={() => {
              this.setState({ keyboardOpened: true, descError: false });
            }}
            onBlur={() => {
              this.setState({ keyboardOpened: false });
            }}
            style={{ marginTop: 5 }}
            multiline={true}
            numberOfLines={7}
            mode="outlined"
            value={this.state.desc}
            onChangeText={text => this.setState({ desc: text, descError: false })}
            label={this.props.screenProps.currentLang.labels.description}
            placeholder={this.props.screenProps.currentLang.labels.supportDesc}
            error={this.state.descError}
            theme={{
              colors: {
                placeholder: "rgba(51, 66, 91, 0.85)", text: colors.dark, primary: colors.dark,
                underlineColor: "transparent", background: colors.light
              }
            }}
          />
          {this.state.currentError !== null && <Text style={styles.error}>{this.state.currentError}</Text>}
          {!this.state.keyboardOpened && (<Button
            containerStyle={{ marginTop: "auto", marginBottom: 0 }}
            titleStyle={{ color: colors.light }}
            buttonStyle={{ backgroundColor: colors.dark }}
            title={this.props.screenProps.currentLang.labels.finish}
            type="solid"
            onPress={() => this.handleReport()}
            raised
          />)}
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  mainWrapper: {
    display: "flex",
    flex: 1,
    backgroundColor: colors.light
  },
  error: {
    color: colors.red,
    fontSize: 16,
    textAlign: "center",
    marginTop: "auto",
    lineHeight: 15
  }
});