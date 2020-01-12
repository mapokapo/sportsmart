import React, { Component } from "react";
import { Text, View, StyleSheet, Picker, UIManager, LayoutAnimation, Keyboard, ToastAndroid } from "react-native";
import { TextInput } from "react-native-paper";
import { Button } from "react-native-elements";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as colors from "../../media/colors";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { GraphRequest, GraphRequestManager } from "react-native-fbsdk";

export default class AdditionalInfoScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      weightText: "",
      weightError: false,
      heightText: "",
      heightError: false,
      gender: "male",
      unit: "metric",
      bornText: new Date(null),
      bornError: false,
      loading: false,
      datePickerOpen: false,
      currentError: null,
      currentTimeout: null,
      keyboardOpened: false,
      profileImage: null
    }

    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    }

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

  weightCheck = (text) => {
    return /^\d+\.?\d+$/g.test(text);
  }

  heightCheck = (text) => {
    return /^\d+\.?\d+$/g.test(text);
  }

  ageCheck = (born) => {
    return born.getTime() !== 0;
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

  handleAdditionalInfo = () => {
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
      let date = new Date();
      const user = auth().currentUser;
      let dbUpload = async () => {
        firestore().collection("users").doc(user.uid).set({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          bio: "",
          weight: Number(this.state.weightText),
          height: Number(this.state.heightText),
          profileImage: this.state.profileImage ? this.state.profileImage : user.photoURL,
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
              ToastAndroid.show(this.props.screenProps.currentLang.errors.networkError, ToastAndroid.SHORT);
              break;
            default:
              ToastAndroid.show(this.props.screenProps.currentLang.errors.unhandledError + err.message, ToastAndroid.LONG);
          }
          this.setState({ loading: false });
        });
      }
      if (user.providerData[0].providerId === "facebook.com") {
        const infoRequest = new GraphRequest(
          "/me?fields=name,email,picture.type(large)",
          null,
          (err, res) => {
            if (err) return;
            this.setState({ profileImage: res.picture.data.url }, () => {
              dbUpload();
            });
          }
        );
        new GraphRequestManager().addRequest(infoRequest).start();
      } else {
        dbUpload();
      }
    });
  }

  render() {
    return (
      <View style={styles.mainWrapper}>
        {!this.state.keyboardOpened && (<Text style={{ color: colors.dark, fontSize: 18, textAlign: "center", marginTop: 40 }}>{this.props.screenProps.currentLang.labels.additionalInfoText}</Text>)}
        <View style={{ display: "flex", marginTop: "auto", marginBottom: 0, flex: 5, justifyContent: "center" }}>
          <View style={{ display: "flex", flexDirection: "row" }}>
            {this.props.screenProps.currentLang.name === "english" && (<View style={{ flex: 1, borderRadius: 5, borderColor: colors.dark, borderWidth: 1, marginRight: 5, marginLeft: 5, marginVertical: 5, paddingVertical: 5 }}>
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
            <View style={{ flex: 1, borderRadius: 5, borderColor: colors.dark, borderWidth: 1, marginRight: 5, marginLeft: 5, marginVertical: 5, paddingVertical: 5 }}>
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
            </View>
          </View>
          <View style={{ marginHorizontal: 5 }}>
            <TextInput
              keyboardType="decimal-pad"
              error={this.state.heightError}
              style={{ marginBottom: 5 }}
              mode="outlined"
              label={this.props.screenProps.currentLang.labels.height}
              value={this.state.heightText}
              onChangeText={text => this.setState({ heightText: text.replace(/,/g, "."), heightError: false })}
              onFocus={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                this.setState({ heightError: false, keyboardOpened: true })
              }}
              onBlur={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                this.setState({ keyboardOpened: false })
              }}
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
          <View style={{ marginHorizontal: 5 }}>
            <TextInput
              keyboardType="numeric"
              error={this.state.weightError}
              style={{ marginBottom: 5 }}
              mode="outlined"
              label={this.props.screenProps.currentLang.labels.weight}
              value={this.state.weightText}
              onChangeText={text => this.setState({ weightText: text.replace(/,/g, "."), weightError: false })}
              onFocus={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                this.setState({ weightError: false, keyboardOpened: true })
              }}
              onBlur={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                this.setState({ keyboardOpened: false })
              }}
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
          <View style={{ display: "flex", minHeight: 63, paddingHorizontal: 5 }}>
            <Button onPress={() => this.setState({ datePickerOpen: true })} raised titleStyle={{ color: colors.dark, fontWeight: "bold", flex: 1, backgroundColor: colors.light }} buttonStyle={{ marginTop: 0, marginBottom: 0, backgroundColor: colors.light, flex: 1 }} containerStyle={{ flex: 1, display: "flex", borderRadius: 5, borderColor: this.state.bornError ? colors.red : "#000", borderWidth: 1, marginVertical: 5, marginVertical: 5 }} title={this.ageCheck(this.state.bornText) ? this.state.bornText.toLocaleDateString(this.state.unit === "metric" ? "en-GB" : "en-US") : this.props.screenProps.currentLang.labels.born} iconContainerStyle={{ marginRight: -3 }} iconRight icon={{type: "material-community", name: "calendar", size: 20, color: colors.dark}} />
          </View>
        </View>
        {this.state.datePickerOpen && (<DateTimePicker
          value={this.state.bornText}
          mode="date"
          is24Hour={true}
          display="calendar"
          onChange={(event, date) => event.type === "dismissed" ? this.setState({ datePickerOpen: false }) : this.setState({ bornText: date, datePickerOpen: false })}
          onDismiss={() => this.setState({ datePickerOpen: false })}
        />)}
        {this.state.currentError !== null && <Text style={styles.error}>{this.state.currentError}</Text>}
        <Button
          containerStyle={{ marginTop: "auto", marginBottom: 30 }}
          titleStyle={{ color: colors.light }}
          buttonStyle={{ backgroundColor: colors.dark }}
          title={this.props.screenProps.currentLang.labels.register}
          type="solid"
          raised
          loading={this.state.loading}
          onPress={this.handleAdditionalInfo}
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
    paddingHorizontal: 25
  },
  error: {
    color: colors.red,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 15
  }
});