import React, { Component } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Keyboard, LayoutAnimation, UIManager, Image, Platform } from "react-native";
import { Button, SocialIcon } from "react-native-elements";
import { TextInput, Portal, Dialog, Menu, Divider, IconButton } from "react-native-paper";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { AccessToken, LoginManager } from "react-native-fbsdk";
import { GoogleSignin, statusCodes } from "@react-native-community/google-signin";
import * as colors from "../../media/colors";

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
      passError: false,
      visible: false
    }

    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    this.login = React.createRef();
  }

  capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
    GoogleSignin.configure({
      webClientId: "373206170368-e8jrbu94tgslrel2h8ar0835pkc2jl37.apps.googleusercontent.com",
      androidClientId: __DEV__ ? "373206170368-vprikdvlmml7qd85s5m83kmn5nodl69i.apps.googleusercontent.com" : "373206170368-o7fvdepqndj5q9in65c6ct0v4pallnhm.apps.googleusercontent.com",
      offlineAccess: true,
      forceConsentPrompt: true,
      scopes: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"]
    });
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
        this.triggerError(this.props.screenProps.currentLang.errors.emailEmpty);
      })
      return;
    }
    if (!this.emailCheck(this.state.emailText)) {
      this.setState({ emailError: true }, () => {
        this.triggerError(this.props.screenProps.currentLang.errors.emailInvalid);
      })
      return;
    }
    if (this.state.passText === "") {
      this.setState({ passError: true }, () => {
        this.triggerError(this.props.screenProps.currentLang.errors.passEmpty);
      });
      return;
    }
    this.setState({ loading: true }, () => {
      auth().signInWithEmailAndPassword(this.state.emailText, this.state.passText).then(() => {
        this.setState({ loading: false });
        this.props.navigation.navigate("App");
      }).catch(err => {
        switch(err.code) {
          case "auth/user-not-found":
            this.triggerDialog(this.props.screenProps.currentLang.errors.userNotFound);
            break;
          case "auth/wrong-password":
            this.triggerDialog(this.props.screenProps.currentLang.errors.passIncorrect);
            break;
          case "auth/unknown":
            this.triggerDialog(this.props.screenProps.currentLang.errors.networkError);
            break;
          default:
            this.triggerDialog(this.props.screenProps.currentLang.errors.unhandledError + err.message);
        }
        this.setState({ loading: false });
      });
    });
  }

  render = () => {
    return (
      <View style={styles.mainWrapper}>
        <Portal>
          <Dialog visible={this.state.dialogText !== null} onDismiss={this.hideDialog}>
            <Dialog.Title>{this.props.screenProps.currentLang.labels.error}</Dialog.Title>
            <Dialog.Content>
              <Text style={{ color: colors.dark }}>{this.state.dialogText}</Text>
            </Dialog.Content>
          </Dialog>
        </Portal>
        <Menu
          theme={{
            colors: {
              primary: colors.dark, placeholder: colors.dark, text: colors.dark,
              background: colors.light, backdrop: colors.dark
            }
          }}
          style={{ left: 38, top: 38 }}
          visible={this.state.visible}
          onDismiss={() => this.setState({ visible: false })}
          anchor={
            <IconButton
              icon="translate"
              color={colors.light}
              size={30}
              style={{ top: 10, left: 10 }}
              onPress={() => this.setState({ visible: true })}
            />
          }
        >
        {this.props.screenProps.languages.map(lang => (
          <View key={lang.name}><Menu.Item style={{ paddingVertical: 2 }} title={this.capitalize(lang.name)} onPress={() => {
            this.setState({ visible: false });
            this.props.screenProps.changeLanguage(lang.name);
          }} />
          {this.props.screenProps.languages.indexOf(lang) !== this.props.screenProps.languages.length-1 && <Divider />}</View>
        ))}
        </Menu>
        {!this.state.keyboardOpened && (<View style={{ marginHorizontal: 15, flex: 4, justifyContent: "center", alignItems: "center" }}>
          <Image
            source={require("../../media/sportsmart_icons/logo.png")}
            style={{ width: 225, height: 225 }}
          />
        </View>)}
          <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
            <TouchableOpacity onPress={() => {
              this.setState({ loading: true }, async () => {
                const result = await LoginManager.logInWithPermissions(["public_profile", "email"]);
                const data = await AccessToken.getCurrentAccessToken();
                if (result && data) {
                  const credential = auth.FacebookAuthProvider.credential(data.accessToken);
                  auth().signInWithCredential(credential).then(user => {
                    firestore().collection("users").doc(user.user.uid).get().then(doc => {
                      if (doc.exists) {
                        this.setState({ loading: false }, () => {
                          this.props.navigation.navigate("App");
                        });
                      } else {
                        this.setState({ loading: false }, () => {
                          this.props.navigation.navigate("AdditionalInfo");
                        });
                      }
                    });
                  }).catch(err => {
                    if (err.code === "auth/account-exists-with-different-credential") {
                      this.setState({ loading: false }, () => {
                        this.triggerDialog(this.props.screenProps.currentLang.errors.thirdPartyLoginError);
                      });
                    } else {
                      this.setState({ loading: false }, () => {
                        this.triggerDialog(this.props.screenProps.currentLang.errors.unhandledError + err);
                      });
                    }
                  });
                } else {
                  this.setState({ loading: false });
                }
              });
            }}>
              <SocialIcon type="facebook" raised color={colors.dark} style={{ marginTop: 20, width: this.state.keyboardOpened ? 48 : 32, height: this.state.keyboardOpened ? 48 : 32 }} iconSize={this.state.keyboardOpened ? 24 : 16} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
              this.setState({ loading: true }, async () => {
                try {
                  await GoogleSignin.hasPlayServices();
                  const userInfo = await GoogleSignin.signIn();
                  const credential = auth.GoogleAuthProvider.credential(userInfo.idToken, userInfo.accessToken);
                  auth().signInWithCredential(credential).then(user => {
                    firestore().collection("users").doc(user.user.uid).get().then(doc => {
                      if (doc.exists) {
                        this.setState({ loading: false }, () => {
                          this.props.navigation.navigate("App");
                        });
                      } else {
                        this.setState({ loading: false }, () => {
                          this.props.navigation.navigate("AdditionalInfo");
                        });
                      }
                    });
                  });
                } catch (error) {
                  if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                    this.triggerDialog(this.props.screenProps.currentLang.errors.googlePlayServicesMissing);
                  } else if (error.code === statusCodes.SIGN_IN_CANCELLED || error.code === statusCodes.IN_PROGRESS) {
                  } else {
                    this.triggerDialog(this.props.screenProps.currentLang.errors.unhandledError + JSON.stringify(error));
                  }
                  this.setState({ loading: false });
                }
              });
            }}>
              <SocialIcon type="google" raised color={colors.dark} style={{ marginTop: 20, width: this.state.keyboardOpened ? 48 : 32, height: this.state.keyboardOpened ? 48 : 32 }} iconSize={this.state.keyboardOpened ? 24 : 16} />
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
              label={this.props.screenProps.currentLang.labels.email}
              value={this.state.emailText}
              returnKeyType="next"
              onSubmitEditing={() => this.login.current.focus()}
              blurOnSubmit={false}
              onChangeText={text => this.setState({ emailText: text.replace(/ /g, ""), emailError: false })}
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
              label={this.props.screenProps.currentLang.labels.password}
              value={this.state.passText}
              returnKeyType="done"
              onSubmitEditing={this.handleLogin}
              blurOnSubmit={false}
              onChangeText={text => this.setState({ passText: text, passError: false })}
              ref={this.login}
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
            <View style={{ display: "flex", justifyContent: "space-around", alignItems: "center", flexDirection: "row", flexWrap: "wrap" }}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("Register")}><Text style={{ color: colors.blue, marginTop: -1, fontSize: 16 }}>{this.props.screenProps.currentLang.labels.registerText}</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("ForgotPass")}><Text style={{ color: colors.blue, marginTop: -1, fontSize: 16 }}>{this.props.screenProps.currentLang.labels.resetPassText}</Text></TouchableOpacity>
            </View>
          </View>
          {this.state.currentError !== null && <Text style={styles.error}>{this.state.currentError}</Text>}
          <View style={{ marginHorizontal: 15, flex: 2 }}>
            <Button
              titleStyle={{ color: colors.light }}
              buttonStyle={{ backgroundColor: colors.red }}
              containerStyle={{ marginTop: "auto", marginBottom: "auto" }}
              title={this.props.screenProps.currentLang.labels.login}
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