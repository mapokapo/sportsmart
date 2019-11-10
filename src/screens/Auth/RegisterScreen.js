import React, { Component } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Keyboard, LayoutAnimation, UIManager, Platform, Dimensions } from "react-native";
import { Button, Icon } from "react-native-elements";
import { TextInput, Menu, Portal, Dialog } from "react-native-paper";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import CustomPicker from "../../components/CustomPicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default class RegisterScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nameText: "",
      emailText: "",
      passText: "",
      weightText: "",
      heightText: "",
      bioText: "",
      nameError: false,
      emailError: false,
      passError: false,
      weightError: false,
      heightError: false,
      loading: false,
      currentError: null,
      keyboardOpened: false,
      dialogText: null,
      currentTimeout: null,
      unit: "metric",
      keyboardOpened: false
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

  nameCheck = (text) => {
    return /^[a-zA-Z ]+$/g.test(text);
  }

  passCheck = (text) => {
    return /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/g.test(text);
  }

  emailCheck = (text) => {
    return /^\w+@\w+\.\w+$/g.test(text);
  }

  weightCheck = (text) => {
    return /^\d+\.?\d+$/g.test(text);
  }

  heightCheck = (text) => {
    return /^\d+\.?\d+$/g.test(text);
  }

  handleRegister = () => {
    if (this.state.nameText === "") {
      this.setState({ nameError: true }, () => {
        this.triggerError("Please fill in the name field.");
      });
      return;
    }
    if (!this.nameCheck(this.state.nameText)) {
      this.setState({ nameError: true }, () => {
        this.triggerError("Name must not contain special characters.");
      })
      return;
    }
    if (this.state.passText === "") {
      this.setState({ passError: true }, () => {
        this.triggerError("Please fill in the password field.");
      });
      return;
    }
    if (!this.passCheck(this.state.passText)) {
      this.setState({ passError: true }, () => {
        this.triggerError("Password must have at least 1 number, 1 symbol, and 8 letters.");
      })
      return;
    }
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
    if (this.state.heightText === "") {
      this.setState({ heightError: true }, () => {
        this.triggerError("Please fill in the height field.");
      })
      return;
    }
    if (!this.heightCheck(this.state.heightText)) {
      this.setState({ heightError: true }, () => {
        this.triggerError("Invalid height. Please try again (commas not allowed)");
      })
      return;
    }
    if (this.state.weightText === "") {
      this.setState({ weightError: true }, () => {
        this.triggerError("Please fill in the weight field.");
      })
      return;
    }
    if (!this.weightCheck(this.state.weightText)) {
      this.setState({ weightError: true }, () => {
        this.triggerError("Invalid weight. Please try again (commas not allowed)");
      })
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    this.setState({ loading: true }, () => {
      auth().createUserWithEmailAndPassword(this.state.emailText, this.state.passText).then(userCredential => {
        firestore().collection("users").add({
          uid: userCredential.user.uid,
          name: this.state.nameText,
          email: this.state.emailText,
          bio: this.state.bioText,
          weight: Number(this.state.weightText),
          height: Number(this.state.heightText),
          profileImage: this.state.profileImage || null
        }).then(() => {
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
              this.triggerDialog("An unhandled error has occured: line186 \n" + err.message);
          }
          this.setState({ loading: false });
        });
      }).catch(err => {
        switch(err.code) {
          case "auth/user-not-found":
            this.triggerDialog("No user corresponds to those credentials.");
            break;
          case "auth/unknown":
            this.triggerDialog("Network error. Please try again.");
            break;
          default:
            this.triggerDialog("An unhandled error has occured: asdasd \n" + err.message);
        }
        this.setState({ loading: false })
      });
    });
  }

  render() {
    return (
      <KeyboardAwareScrollView keyboardShouldPersistTaps="always" keyboardDismissMode="on-drag" contentContainerStyle={{ flexGrow: 1 }} style={styles.mainWrapper}>
        <Portal>
          <Dialog visible={this.state.dialogText !== null} onDismiss={this.hideDialog}>
            <Dialog.Title>Error</Dialog.Title>
            <Dialog.Content>
              <Text>{this.state.dialogText}</Text>
            </Dialog.Content>
          </Dialog>
        </Portal>
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", marginHorizontal: 15 }}>
          <View style={{ width: 150, height: 150,  display: "flex", justifyContent: "center", alignItems: "center" }}>
            <TouchableOpacity>
              <Icon name="add-a-photo" size={125} color={colors.dark} />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <TextInput
              autoCapitalize="words"
              textContentType="name"
              error={this.state.nameError}
              style={{ marginBottom: 5 }}
              mode="outlined"
              label="Name"
              value={this.state.nameText}
              onChangeText={text => this.setState({ nameText: text, nameError: false })}
              onFocus={() => this.setState({ nameError: false, keyboardOpened: true }, () => {
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
              style={{ marginBottom: 5 }}
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
          </View>
        </View>
        <View style={{ flex: 10, display: "flex" }}>
          <TextInput
            autoCapitalize="none"
            textContentType="emailAddress"
            error={this.state.emailError}
            style={{ marginBottom: 5, marginHorizontal: 15 }}
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
            multiline={true}
            numberOfLines={5}
            style={{ marginBottom: 5, marginHorizontal: 15 }}
            mode="outlined"
            label="Bio (optional)"
            value={this.state.bioText}
            onChangeText={text => this.setState({ bioText: text })}
            onFocus={() => this.setState({ keyboardOpened: true }, () => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            })}
            theme={{
              colors: {
                placeholder: colors.dark, text: colors.dark, primary: colors.dark,
                underlineColor: "transparent", background: colors.light
              }
            }}
          />
          <CustomPicker unit={this.state.unit} menuOnPress={() => this.setState({ unitPickerVisible: true })} visible={this.state.unitPickerVisible} onDismiss={() => this.setState({     unitPickerVisible: false })}>
            <Menu.Item title="Metric" onPress={() => {
              this.setState({ unit: "metric", unitPickerVisible: false });
            }} />
            <Menu.Item title="Imperial" onPress={() => {
              this.setState({ unit: "imperial", unitPickerVisible: false });
            }} />
          </CustomPicker>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <View style={{ flex: 1, marginHorizontal: 15 }}>
              <TextInput
                keyboardType="decimal-pad"
                error={this.state.heightError}
                style={{ marginBottom: 5 }}
                mode="outlined"
                label="Height"
                value={this.state.heightText}
                onChangeText={text => this.setState({ heightText: text, heightError: false })}
                onFocus={() => this.setState({ heightError: false, keyboardOpened: true }, () => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                })}
                theme={{
                  colors: {
                    placeholder: colors.dark, text: colors.dark, primary: colors.dark,
                    underlineColor: "transparent", background: colors.light
                  }
                }}
              />
              <Text style={{ position: "absolute", left: 120, top: 26, color: colors.dark }}>{this.state.unit === "metric" ? "M" : "FT"}</Text>
              <Icon color={colors.dark} containerStyle={{ position: "absolute", left: 137, top: 20 }} type="material-community" name="human" size={26} />
            </View>
            <View style={{ flex: 1, marginHorizontal: 15 }}>     
              <TextInput
                keyboardType="numeric"
                error={this.state.weightError}
                style={{ marginBottom: 5 }}
                mode="outlined"
                label="Weight"
                value={this.state.weightText}
                onChangeText={text => this.setState({ weightText: text, weightError: false })}
                onFocus={() => this.setState({ weightError: false, keyboardOpened: true }, () => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                })}
                theme={{
                  colors: {
                    placeholder: colors.dark, text: colors.dark, primary: colors.dark,
                    underlineColor: "transparent", background: colors.light
                  }
                }}
              />
              <Text style={{ position: "absolute", left: 115, top: 26, color: colors.dark }}>{this.state.unit === "metric" ? "KG" : "LB"}</Text>
              <Icon color={colors.dark} containerStyle={{ position: "absolute", left: 137, top: 20 }} type="material-community" name={"weight-" + (this.state.unit === "metric" ? "kilogram" : "pound")} size={26} />
            </View>
          </View>
        </View>
        {this.state.currentError !== null && <Text style={styles.error}>{this.state.currentError}</Text>}
        <View style={{ flex: 2, marginHorizontal: 15, display: "flex"}}>
          <Button
            titleStyle={{ color: colors.light }}
            buttonStyle={{ backgroundColor: colors.red }}
            title="Register"
            type="solid"
            raised
            loading={this.state.loading}
            onPress={this.handleRegister}
          />
        </View>
      </KeyboardAwareScrollView>
    )
  }
}

import * as colors from "../../media/colors";

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
    marginBottom: 10,
    lineHeight: 15
  }
});