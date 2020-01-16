import React, { Component } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Keyboard, LayoutAnimation, UIManager, Platform, PermissionsAndroid, ToastAndroid, Picker } from "react-native";
import { Button, Icon, Image } from "react-native-elements";
import { TextInput, Portal, Dialog } from "react-native-paper";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import ImagePicker from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as colors from "../../media/colors";

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
      bornText: new Date(null),
      nameError: false,
      emailError: false,
      passError: false,
      weightError: false,
      heightError: false,
      bornError: false,
      loading: false,
      currentError: null,
      keyboardOpened: false,
      dialogText: null,
      currentTimeout: null,
      unit: "metric", /* safe user info */
      keyboardOpened: false,
      profileImage: null /* safe user info */,
      lowerInputFocused: false,
      higherInputFocused: false,
      gender: "male",
      languages: this.props.screenProps.languages,
      currentLang: this.props.screenProps.currentLang
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
    return /^[\-/A-Za-z\u00C0-\u017F ]+$/g.test(text);
  }

  passCheck = (text) => {
    return /^(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*.,\s()_+=\-~`{}|":?/><\\';\[\]]).{8,}$/.test(text);
  }

  emailCheck = (text) => {
    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(text).toLowerCase());
  }

  weightCheck = (text) => {
    return /^\d+\.?\d+$/g.test(text);
  }

  heightCheck = (text) => {
    return /^\d+\.?\d+$/g.test(text);
  }

  ageCheck = (born) => {
    return born.getTime() !== 0;
  }

  handleRegister = async () => {
    if (this.state.nameText === "") {
      this.setState({ nameError: true }, () => {
        this.triggerError(this.props.screenProps.currentLang.errors.nameEmpty);
      });
      return;
    }
    if (!this.nameCheck(this.state.nameText)) {
      this.setState({ nameError: true }, () => {
        this.triggerError(this.props.screenProps.currentLang.errors.nameInvalid);
      })
      return;
    }
    if (this.state.passText === "") {
      this.setState({ passError: true }, () => {
        this.triggerError(this.props.screenProps.currentLang.errors.passEmpty);
      });
      return;
    }
    if (!this.passCheck(this.state.passText)) {
      this.setState({ passError: true }, () => {
        this.triggerError(this.props.screenProps.currentLang.errors.passInvalid);
      })
      return;
    }
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
    if (this.state.heightText === "") {
      this.setState({ heightError: true }, () => {
        this.triggerError(this.props.screenProps.currentLang.errors.heightEmpty);
      })
      return;
    }
    if (!this.heightCheck(this.state.heightText)) {
      this.setState({ heightError: true }, () => {
        this.triggerError(this.props.screenProps.currentLang.errors.heightInvalid);
      })
      return;
    }
    if (this.state.weightText === "") {
      this.setState({ weightError: true }, () => {
        this.triggerError(this.props.screenProps.currentLang.errors.weightEmpty);
      })
      return;
    }
    if (!this.weightCheck(this.state.weightText)) {
      this.setState({ weightError: true }, () => {
        this.triggerError(this.props.screenProps.currentLang.errors.weightInvalid);
      })
      return;
    }
    if (!this.ageCheck(this.state.bornText)) {
      this.setState({ bornError: true }, () => {
        this.triggerError(this.props.screenProps.currentLang.errors.ageEmpty);
      })
      return;
    }
    Keyboard.dismiss();
    this.setState({ loading: true }, () => {
      auth().createUserWithEmailAndPassword(this.state.emailText, this.state.passText).then(userCredential => {
        let date = new Date();
        let dbUpload = async () => {
          firestore().collection("users").doc(userCredential.user.uid).set({
            uid: userCredential.user.uid,
            name: this.state.nameText,
            email: this.state.emailText,
            bio: this.state.bioText,
            weight: Number(this.state.weightText),
            height: Number(this.state.heightText),
            profileImage: this.state.profileImage,
            joined: date,
            unit: this.state.unit,
            born: this.state.bornText.toDateString(),
            gender: this.state.gender
          }).then(() => {
            this.setState({ loading: false });
            this.props.navigation.navigate("App");
          }).catch(err => {
            switch(err.code) {
              case "auth/unknown":
                this.triggerDialog(this.props.screenProps.currentLang.errors.networkError);
                break;
              default:
                this.triggerDialog(this.props.screenProps.currentLang.errors.unhandledError + err.message);
            }
            this.setState({ loading: false });
          });
        }
        let ref = storage().ref("profileImages/").child(userCredential.user.uid);
        let ext = this.state.profileImage !== null && this.state.profileImage.path ? this.state.profileImage.path.split(".")[1] : "png";
        ref.putFile(this.state.profileImage !== null && this.state.profileImage.path ? this.state.profileImage.path : "", { contentType: `image/${ext}` }).then(() => {
          ref.getDownloadURL().then(url => {
            let finalUrl = url;
            if (this.state.profileImage === null) {
              finalUrl = "https://firebasestorage.googleapis.com/v0/b/sportsmart-629ee.appspot.com/o/profileImages%2Fprofile_picture.png?alt=media&token=cc89416a-bc8f-4490-b6ba-ec9e4f4dccaa";
            }
            this.setState({ profileImage: finalUrl }, () => dbUpload());
          }).catch(err => {
            if (this.state.profileImage !== null) {
              switch(err.code) {
                case "auth/unknown":
                  ToastAndroid.show(this.props.screenProps.currentLang.errors.imageNetworkError, ToastAndroid.LONG);
                  break;
                default:
                  ToastAndroid.show(this.props.screenProps.currentLang.errors.imageUnhandledError + err.message, ToastAndroid.LONG);
              }
            }
            this.setState({ profileImage: "https://firebasestorage.googleapis.com/v0/b/sportsmart-629ee.appspot.com/o/profileImages%2Fprofile_picture.png?alt=media&token=cc89416a-bc8f-4490-b6ba-ec9e4f4dccaa" }, () => dbUpload());
          })
        }).catch(err => {
          if (this.state.profileImage !== null) {
            switch(err.code) {
              case "auth/unknown":
                ToastAndroid.show(this.props.screenProps.currentLang.errors.imageNetworkError, ToastAndroid.LONG);
                break;
              default:
                ToastAndroid.show(this.props.screenProps.currentLang.errors.imageNetworkError + err.message, ToastAndroid.LONG);
            }
          }
          this.setState({ profileImage: "https://firebasestorage.googleapis.com/v0/b/sportsmart-629ee.appspot.com/o/profileImages%2Fprofile_picture.png?alt=media&token=cc89416a-bc8f-4490-b6ba-ec9e4f4dccaa" }, () => dbUpload());
        });
      }).catch(err => {
        switch(err.code) {
          case "auth/email-already-in-use":
            this.triggerDialog(this.props.screenProps.currentLang.errors.emailInUse);
            this.triggerError(this.props.screenProps.currentLang.errors.emailInUse);
            this.setState({ emailError: true });
            break;
          case "auth/invalid-email":
            this.triggerDialog(this.props.screenProps.currentLang.errors.emailInvalid);
            this.triggerError(this.props.screenProps.currentLang.errors.emailInvalid);
            this.setState({ emailError: true });
            break;
          case "auth/weak-password":
            this.triggerDialog(this.props.screenProps.currentLang.errors.passInvalid);
            this.triggerError(this.props.screenProps.currentLang.errors.passInvalid);
            this.setState({ passError: true });
            break;
          case "auth/unknown":
            this.triggerDialog(this.props.screenProps.currentLang.errors.networkError);
            break;
          default:
            this.triggerDialog(this.props.screenProps.currentLang.errors.unhandledError + err.message);
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
          title: this.props.screenProps.currentLang.labels.storagePermissionTitle,
          message: this.props.screenProps.currentLang.labels.storagePermissionText,
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
      <View style={styles.mainWrapper}>
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
              style={{ marginBottom: this.state.keyboardOpened ? 5 : 10 }}
              mode="outlined"
              label={this.props.screenProps.currentLang.labels.name}
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
              style={{ marginBottom: this.state.keyboardOpened ? 5 : 10 }}
              mode="outlined"
              label={this.props.screenProps.currentLang.labels.password}
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
            style={{ marginBottom: this.state.keyboardOpened ? 5 : 10, marginHorizontal: 15 }}
            mode="outlined"
            label={this.props.screenProps.currentLang.labels.email}
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
            style={{ marginBottom: this.state.keyboardOpened ? 5 : 10, marginHorizontal: 15 }}
            mode="outlined"
            label={this.props.screenProps.currentLang.labels.bio}
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
            <View style={{ display: "flex", flexDirection: "row" }}>
              {!this.state.higherInputFocused && this.props.screenProps.currentLang.name === "english" && (<View style={{ flex: 1, borderRadius: 5, borderColor: colors.dark, borderWidth: 1, marginRight: 5, marginLeft: 15, marginVertical: this.state.keyboardOpened ? 5 : 10, paddingVertical: 5 }}>
                <Text style={{ color: colors.dark, position: "absolute", top: -11, left: 10, backgroundColor: colors.light, paddingVertical: 1, paddingHorizontal: 5 }}>Unit</Text>
                <Picker
                  style={{ color: colors.dark }}
                  mode="dropdown"
                  selectedValue={this.state.unit}
                  onValueChange={(itemValue) => {
                    this.setState({ unit: itemValue });
                  }}>
                  <Picker.Item label="Metric" value="metric" />
                  <Picker.Item label="Imperial" value="imperial" />
                </Picker>
              </View>)}
              {!this.state.higherInputFocused && (<View style={{ flex: 1, borderRadius: 5, borderColor: colors.dark, borderWidth: 1, marginRight: 15, marginLeft: this.props.screenProps.currentLang.name !== "english" ? 15 : 5, marginVertical: this.state.keyboardOpened ? 5 : 10, paddingVertical: 5 }}>
                <Text style={{ color: colors.dark, position: "absolute", top: -11, left: 10, backgroundColor: colors.light, paddingVertical: 1, paddingHorizontal: 5 }}>{this.props.screenProps.currentLang.labels.genderText}</Text>
                <Picker
                  mode="dropdown"
                  style={{ color: colors.dark }}
                  itemStyle={{ color: colors.dark, backgroundColor: colors.light }}
                  selectedValue={this.state.gender}
                  onValueChange={(itemValue) => {
                    this.setState({ gender: itemValue });
                  }}>
                    <Picker.Item label={this.props.screenProps.currentLang.labels.male} value="male" />
                    <Picker.Item label={this.props.screenProps.currentLang.labels.female} value="female" />
                </Picker>
              </View>)}
            </View>
          {!this.state.higherInputFocused && (<View style={{ display: "flex", flexDirection: "row" }}>
            <View style={{ flex: 9, marginLeft: 15, marginRight: 5 }}>
              <TextInput
                keyboardType="decimal-pad"
                error={this.state.heightError}
                style={{ marginBottom: 5 }}
                mode="outlined"
                label={this.props.screenProps.currentLang.labels.height}
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
              <View style={{ position: "absolute", right: 7, top: 0, bottom: 0, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: colors.dark, fontWeight: "bold" }}>{this.state.unit === "metric" ? "CM" : "IN"}</Text>
              </View>
            </View>
            <View style={{ flex: 9, marginHorizontal: 5 }}>     
              <TextInput
                keyboardType="numeric"
                error={this.state.weightError}
                style={{ marginBottom: 5 }}
                mode="outlined"
                label={this.props.screenProps.currentLang.labels.weight}
                value={this.state.weightText}
                onChangeText={text => this.setState({ weightText: text.replace(/,/g, "."), weightError: false })}
                onFocus={() => this.setState({ weightError: false, keyboardOpened: true, lowerInputFocused: true })}
                onBlur={() => this.setState({ lowerInputFocused: false })}
                blurOnSubmit={false}
                ref={this.weight}
                returnKeyType="next"
                theme={{
                  colors: {
                    placeholder: colors.dark, text: colors.dark, primary: colors.dark,
                    underlineColor: "transparent", background: colors.light
                  }
                }}
              />
              <View style={{ position: "absolute", right: 7, top: 0, bottom: 0, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                <Text style={{ color: colors.dark, fontWeight: "bold" }}>{this.state.unit === "metric" ? "KG" : "LB"}</Text>
              </View>
            </View>
            <Button onPress={() => this.setState({ datePickerOpen: true })} raised titleStyle={{ color: colors.dark, fontWeight: "bold", flex: 1, backgroundColor: colors.light }} buttonStyle={{ marginTop: 0, marginBottom: 0, backgroundColor: colors.light, flex: 1 }} containerStyle={{ display: "flex", flex: 10, borderRadius: 5, borderColor: this.state.bornError ? colors.red : "#000", borderWidth: 1, marginLeft: 5, marginRight: 15, marginVertical: 5 }} title={this.ageCheck(this.state.bornText) ? this.state.bornText.toLocaleDateString(this.state.unit === "metric" ? "en-GB" : "en-US") : this.props.screenProps.currentLang.labels.born} iconContainerStyle={{ marginRight: -3 }} iconRight icon={{type: "material-community", name: "calendar", size: 20, color: colors.dark}} />
            {this.state.datePickerOpen && (<DateTimePicker
              style={{ color: colors.light }}
              value={this.state.bornText}
              mode="date"
              is24Hour={true}
              display="calendar"
              onChange={(event, date) => event.type === "dismissed" ? this.setState({ datePickerOpen: false }) : this.setState({ bornText: date, datePickerOpen: false })}
              onDismiss={() => this.setState({ datePickerOpen: false })}
            />)}
          </View>)}
        </View>
        {this.state.currentError !== null && <Text style={styles.error}>{this.state.currentError}</Text>}
        <View style={{ flex: 2, marginHorizontal: 15, display: "flex"}}>
          {this.state.currentError === null && (<Button
            containerStyle={{ top: this.state.higherInputFocused ? -30 : 0 }}
            titleStyle={{ color: colors.light }}
            buttonStyle={{ backgroundColor: colors.red }}
            title={this.props.screenProps.currentLang.labels.register}
            type="solid"
            raised
            loading={this.state.loading}
            onPress={this.handleRegister}
          />)}
        </View>
      </View>
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
    marginBottom: 10,
    lineHeight: 15
  }
});