import React, { Component } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Keyboard, LayoutAnimation, UIManager, Platform, PermissionsAndroid, ToastAndroid } from "react-native";
import { Button, Icon, Image } from "react-native-elements";
import { TextInput, Menu, Portal, Dialog } from "react-native-paper";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import CustomPicker from "../../components/CustomPicker";
import ImagePicker from 'react-native-image-picker';
import languages from "../../media/languages";

const options = {
  title: "Select Image",
  storageOptions: {
    skipBackup: true,
    path: "images",
  },
}

export default class RegisterScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nameText: "", /* safe user info */
      emailText: "", /* safe user info */
      passText: "",
      weightText: "", /* safe user info */
      heightText: "", /* safe user info */
      bioText: "", /* safe user info */
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
      unit: "metric", /* safe user info */
      keyboardOpened: false,
      profileImage: null /* safe user info */,
      lowerInputFocused: false,
      higherInputFocused: false
    }

    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    this.pass = React.createRef();
    this.email = React.createRef();
    this.bio = React.createRef();
    this.height = React.createRef();
    this.weight = React.createRef();
  }

  _keyboardShown = () => {
    this.setState({ keyboardOpened: true });
  }

  _keyboardHidden = () => {
    this.setState({ keyboardOpened: false, lowerInputFocused: false, higherInputFocused: false });
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

  handleRegister = async () => {
    if (this.state.nameText === "") {
      this.setState({ nameError: true }, () => {
        this.triggerError(languages.currentLang.errors.nameEmpty);
      });
      return;
    }
    if (!this.nameCheck(this.state.nameText)) {
      this.setState({ nameError: true }, () => {
        this.triggerError(languages.currentLang.errors.nameInvalid);
      })
      return;
    }
    if (this.state.passText === "") {
      this.setState({ passError: true }, () => {
        this.triggerError(languages.currentLang.errors.passEmpty);
      });
      return;
    }
    if (!this.passCheck(this.state.passText)) {
      this.setState({ passError: true }, () => {
        this.triggerError(languages.currentLang.errors.passInvalid);
      })
      return;
    }
    if (this.state.emailText === "") {
      this.setState({ emailError: true }, () => {
        this.triggerError(languages.currentLang.errors.emailEmpty);
      })
      return;
    }
    if (!this.emailCheck(this.state.emailText)) {
      this.setState({ emailError: true }, () => {
        this.triggerError(languages.currentLang.errors.emailInvalid);
      })
      return;
    }
    if (this.state.heightText === "") {
      this.setState({ heightError: true }, () => {
        this.triggerError(languages.currentLang.errors.heightEmpty);
      })
      return;
    }
    if (!this.heightCheck(this.state.heightText)) {
      this.setState({ heightError: true }, () => {
        this.triggerError(languages.currentLang.errors.heightInvalid);
      })
      return;
    }
    if (this.state.weightText === "") {
      this.setState({ weightError: true }, () => {
        this.triggerError(languages.currentLang.errors.weightEmpty);
      })
      return;
    }
    if (!this.weightCheck(this.state.weightText)) {
      this.setState({ weightError: true }, () => {
        this.triggerError(languages.currentLang.errors.weightInvalid);
      })
      return;
    }
    Keyboard.dismiss();
    this.setState({ loading: true }, () => {
      auth().createUserWithEmailAndPassword(this.state.emailText, this.state.passText).then(userCredential => {
        let date = new Date();
        let year = date.getFullYear().toString().substr(-2);
        let month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
        let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        let formattedDate = day + "-" + month + "-" + year;
        if (this.state.profileImage !== null) {
          let ref = storage().ref("profileImages/").child(userCredential.user.uid);
          let ext = this.state.profileImage.path.split(".")[1];
          ref.putFile(this.state.profileImage.path, { contentType: `image/${ext}` }).then(item => {
            ref.getDownloadURL().then(url => {
              this.setState({ profileImage: url });
            }).catch(err => {
              switch(err.code) {
                case "auth/unknown":
                  ToastAndroid.show(languages.currentLang.errors.imageNetworkError, ToastAndroid.LONG);
                  break;
                default:
                  ToastAndroid.show(languages.currentLang.errors.imageUnhandledError + err.message, ToastAndroid.LONG);
              }
              this.setState({ profileImage: null });
            })
          }).catch(err => {
            switch(err.code) {
              case "auth/unknown":
                ToastAndroid.show(languages.currentLang.errors.imageNetworkError, ToastAndroid.LONG);
                break;
              default:
                ToastAndroid.show(languages.currentLang.errors.imageNetworkError + err.message, ToastAndroid.LONG);
            }
            this.setState({ profileImage: null });
          });
        }
        firestore().collection("users").doc(userCredential.user.uid).set({
          uid: userCredential.user.uid,
          name: this.state.nameText,
          email: this.state.emailText,
          bio: this.state.bioText,
          weight: Number(this.state.weightText),
          height: Number(this.state.heightText),
          profileImage: this.state.profileImage || null,
          joined: formattedDate,
          admin: 0,
          unit: this.state.unit
        }).then(() => {
          this.setState({ loading: false });
          this.props.navigation.navigate("App");
        }).catch(err => {
          switch(err.code) {
            case "auth/unknown":
              this.triggerDialog(languages.currentLang.errors.networkError);
              break;
            default:
              this.triggerDialog(languages.currentLang.errors.unhandledError + err.message);
          }
          this.setState({ loading: false });
        });
      }).catch(err => {
        switch(err.code) {
          case "auth/unknown":
            this.triggerDialog(languages.currentLang.errors.networkError);
            break;
          default:
            this.triggerDialog(languages.currentLang.errors.unhandledError + err.message);
        }
        this.setState({ loading: false })
      });
    });
  }

  requestStoragePermission = () => new Promise(async (resolve, reject) => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: languages.currentLang.labels.storagePermissionTitle,
          message:
          languages.currentLang.labels.storagePermissionText,
          buttonPositive: "OK",
        },
      );
      resolve();
    } catch (err) {
      reject(err);
    }
  });

  render() {
    return (
      <View enableOnAndroid={true} keyboardShouldPersistTaps="always" keyboardDismissMode="on-drag" contentContainerStyle={{ flexGrow: 1 }} style={styles.mainWrapper}>
        <Portal>
          <Dialog visible={this.state.dialogText !== null} onDismiss={this.hideDialog}>
            <Dialog.Title>Error</Dialog.Title>
            <Dialog.Content>
              <Text>{this.state.dialogText}</Text>
            </Dialog.Content>
          </Dialog>
        </Portal>
        <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", marginHorizontal: 15 }}>
          {!this.state.lowerInputFocused && (<View style={{ width: 150, height: 150, marginRight: 10, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <TouchableOpacity onPress={() => {
              this.requestStoragePermission().then(() => {
                ImagePicker.showImagePicker(options, (response) => {
                  if (!response.didCancel && !response.error) {
                    this.setState({ profileImage: response });
                  }
                });
              });
            }}>
              {this.state.profileImage === null ? (
                <Icon name="add-a-photo" size={125} color={colors.dark} />
              ) : (
                <Image
                  source={{ uri: this.state.profileImage.uri }}
                  style={{ width: 125, height: 125 }}
                  containerStyle={{ overflow: "hidden", borderRadius: 125/2, elevation: 1 }}
                  placeholderStyle={{ display: "none" }}
                />
              )}
            </TouchableOpacity>
          </View>)}
          {!this.state.lowerInputFocused && (<View style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <TextInput
              autoCapitalize="words"
              textContentType="name"
              error={this.state.nameError}
              style={{ marginBottom: 5 }}
              mode="outlined"
              label={languages.currentLang.labels.name}
              value={this.state.nameText}
              onChangeText={text => this.setState({ nameText: text, nameError: false })}
              onFocus={() => this.setState({ nameError: false, keyboardOpened: true, higherInputFocused: true })}
              onBlur={() => this.setState({ higherInputFocused: false })}
              blurOnSubmit={false}
              onSubmitEditing={() => this.pass.current.focus()}
              returnKeyType="next"
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
              label={languages.currentLang.labels.password}
              value={this.state.passText}
              onChangeText={text => this.setState({ passText: text, passError: false })}
              onFocus={() => this.setState({ passError: false, keyboardOpened: true, higherInputFocused: true })}
              onBlur={() => this.setState({ higherInputFocused: false })}
              blurOnSubmit={false}
              ref={this.pass}
              onSubmitEditing={() => this.email.current.focus()}
              returnKeyType="next"
              theme={{
                colors: {
                  placeholder: colors.dark, text: colors.dark, primary: colors.dark,
                  underlineColor: "transparent", background: colors.light
                }
              }}
            />
          </View>)}
        </View>
        <View style={{ flex: 10, display: "flex" }}>
          {!this.state.lowerInputFocused && (<TextInput
            autoCapitalize="none"
            textContentType="emailAddress"
            error={this.state.emailError}
            style={{ marginBottom: 5, marginHorizontal: 15 }}
            mode="outlined"
            label={languages.currentLang.labels.email}
            value={this.state.emailText}
            onChangeText={text => this.setState({ emailText: text, emailError: false })}
            onFocus={() => this.setState({ emailError: false, keyboardOpened: true, higherInputFocused: true })}
            onBlur={() => this.setState({ higherInputFocused: false })}
            blurOnSubmit={false}
            ref={this.email}
            onSubmitEditing={() => this.setState({ higherInputFocused: false, lowerInputFocused: true }, () => this.bio.current.focus())}
            returnKeyType="next"
            theme={{
              colors: {
                placeholder: colors.dark, text: colors.dark, primary: colors.dark,
                underlineColor: "transparent", background: colors.light
              }
            }}
          />)}
          {!this.state.higherInputFocused && (<TextInput
            multiline={true}
            numberOfLines={5}
            style={{ marginBottom: 5, marginHorizontal: 15 }}
            mode="outlined"
            label={languages.currentLang.labels.bio}
            value={this.state.bioText}
            onChangeText={text => this.setState({ bioText: text })}
            onFocus={() => this.setState({ keyboardOpened: true, lowerInputFocused: true })}
            onBlur={() => this.setState({ lowerInputFocused: false })}
            blurOnSubmit={false}
            ref={this.bio}
            onSubmitEditing={() => this.height.current.focus()}
            returnKeyType="default"
            theme={{
              colors: {
                placeholder: colors.dark, text: colors.dark, primary: colors.dark,
                underlineColor: "transparent", background: colors.light
              }
            }}
          />)}
          {!this.state.higherInputFocused && languages.currentLang.name === "english" && (<CustomPicker unit={this.state.unit} menuOnPress={() => this.setState({ unitPickerVisible: true })} visible={this.state.unitPickerVisible} onDismiss={() => this.setState({ unitPickerVisible: false })}>
            <Menu.Item title="Metric" onPress={() => {
              this.setState({ unit: "metric", unitPickerVisible: false });
            }} />
            <Menu.Item title="Imperial" onPress={() => {
              this.setState({ unit: "imperial", unitPickerVisible: false });
            }} />
          </CustomPicker>)}
          {!this.state.higherInputFocused && (<View style={{ display: "flex", flexDirection: "row" }}>
            <View style={{ flex: 1, marginHorizontal: 15 }}>
              <TextInput
                keyboardType="decimal-pad"
                error={this.state.heightError}
                style={{ marginBottom: 5 }}
                mode="outlined"
                label={languages.currentLang.labels.height}
                value={this.state.heightText}
                onChangeText={text => this.setState({ heightText: text.replace(/,/g, "."), heightError: false })}
                onFocus={() => this.setState({ heightError: false, keyboardOpened: true, lowerInputFocused: true })}
                onBlur={() => this.setState({ lowerInputFocused: false })}
                blurOnSubmit={false}
                ref={this.height}
                onSubmitEditing={() => this.weight.current.focus()}
                returnKeyType="next"
                theme={{
                  colors: {
                    placeholder: colors.dark, text: colors.dark, primary: colors.dark,
                    underlineColor: "transparent", background: colors.light
                  }
                }}
              />
              <View style={{ position: "absolute", right: 5, top: 0, bottom: 0, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: colors.dark }}>{this.state.unit === "metric" ? "M" : "FT"}</Text>
                <Icon color={colors.dark} containerStyle={{ top: -2 }} type="material-community" name="human" size={26} />
              </View>
            </View>
            <View style={{ flex: 1, marginHorizontal: 15 }}>     
              <TextInput
                keyboardType="numeric"
                error={this.state.weightError}
                style={{ marginBottom: 5 }}
                mode="outlined"
                label={languages.currentLang.labels.weight}
                value={this.state.weightText}
                onChangeText={text => this.setState({ weightText: text.replace(/,/g, "."), weightError: false })}
                onFocus={() => this.setState({ weightError: false, keyboardOpened: true, lowerInputFocused: true })}
                onBlur={() => this.setState({ lowerInputFocused: false })}
                blurOnSubmit={false}
                ref={this.weight}
                onSubmitEditing={() => this.handleRegister()}
                returnKeyType="done"
                theme={{
                  colors: {
                    placeholder: colors.dark, text: colors.dark, primary: colors.dark,
                    underlineColor: "transparent", background: colors.light
                  }
                }}
              />
              <View style={{ position: "absolute", right: 5, top: 0, bottom: 0, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: colors.dark }}>{this.state.unit === "metric" ? "KG" : "LB"}</Text>
                <Icon color={colors.dark} containerStyle={{ top: -3 }} type="material-community" name={"weight-" + (this.state.unit === "metric" ? "kilogram" : "pound")} size={26} />
              </View>
            </View>
          </View>)}
        </View>
        {this.state.currentError !== null && <Text style={styles.error}>{this.state.currentError}</Text>}
        <View style={{ flex: 2, marginHorizontal: 15, display: "flex"}}>
          <Button
            containerStyle={{ top: this.state.higherInputFocused ? -30 : 0 }}
            titleStyle={{ color: colors.light }}
            buttonStyle={{ backgroundColor: colors.red }}
            title={languages.currentLang.labels.register}
            type="solid"
            raised
            loading={this.state.loading}
            onPress={this.handleRegister}
          />
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