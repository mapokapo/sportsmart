import React, { Component } from "react";
import { Text, FlatList, View, StyleSheet, ToastAndroid, UIManager, LayoutAnimation, TouchableOpacity, PermissionsAndroid, Picker, Platform } from "react-native";
import AppHeader from "../../components/AppHeader";
import * as colors from "../../media/colors";
import { ListItem, Button, Image, Icon, Input } from "react-native-elements";
import { Portal, Dialog, RadioButton, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-community/async-storage";
import PushNotification from "react-native-push-notification";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import { StackActions } from "react-navigation";
import ImagePicker from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const options = {
  title: "Select Image",
  storageOptions: {
    skipBackup: true,
    path: "images",
  },
}

export default class SettingsScreen extends Component {
  constructor(props) {
    super(props);
    this.unsubscribe = null;
    this.state = {
      currentItem: null,
      modalVisible: false,
      modalContent: null,
      passError: false,
      loading: false,
      currentError: null,
      passAttempts: 0,
      currentTimeout: null,
      currentPassTimeout: null,
      currentPassTimeoutTime: 15000,
      profileImage: null,
      nameText: "",
      weightText: "",
      heightText: "",
      bioText: "",
      bornText: new Date(null),
      nameError: false,
      weightError: false,
      heightError: false,
      bornError: false,
      unit: "metric",
      gender: "male",
      passText: "",
      datePickerOpen: false,
      items: [
        {
          title: props.screenProps.currentLang.labels.language,
          icon: "translate",
          iconColor: colors.blue,
          value: props.screenProps.currentLang.name,
          values: props.screenProps.languages.map(({ name }) => name),
          onClick: () => {
            this.setState({ modalVisible: true, modalContent: "lang" });
          }
        },
        {
          title: props.screenProps.currentLang.labels.editProfile,
          icon: "edit",
          iconColor: colors.blue,
          onClick: () => {
            this.setState({ modalVisible: true, modalContent: "editProfile" });
          }
        },
        {
          title: props.screenProps.currentLang.labels.disableAllNotifs,
          icon: "alarm-off",
          iconColor: colors.blue,
          onClick: () => {
            let promiseArr = [];
            this.unsubscribe = auth().onAuthStateChanged(user => {
              if (user) {
                AsyncStorage.getAllKeys((err, keys) => {
                  keys.forEach(key => {
                    if (key.startsWith("sportsmart-notifs-" + user.uid)) {
                      const delItemKey = key.replace("sportsmart-notifs-" + user.uid, "");
                      PushNotification.cancelLocalNotifications({
                        id: delItemKey
                      });
                      promiseArr.push(AsyncStorage.removeItem(key));
                    }
                  })
                }).then(() => {
                  Promise.all(promiseArr).then(() => {
                    String.prototype.format = function() {
                      let args = arguments;
                      return this.replace(/{(\d+)}/g, function(match, number) { 
                        return typeof args[number] != "undefined"
                          ? args[number]
                          : match
                        ;
                      });
                    };
                    ToastAndroid.show(this.props.screenProps.currentLang.labels.notifsDeleted.toString().format(promiseArr.length.toString()), ToastAndroid.SHORT);
                  })
                });
              }
            })
          }
        },
        {
          title: props.screenProps.currentLang.labels.resetPass,
          icon: "lock",
          iconColor: colors.blue,
          opacity: auth().currentUser.providerData[0].providerId === "password" ? 1 : 0.5,
          onClick: () => {
            if (auth().currentUser.providerData[0].providerId === "password") {
              const action = StackActions.push({
                routeName: "ForgotPass",
                params: {
                  from: "settings"
                }
              });
              this.props.navigation.dispatch(action);
            } else
              ToastAndroid.show(props.screenProps.currentLang.errors.thirdPartyPassResetError, ToastAndroid.LONG);
          }
        },
        {
          title: props.screenProps.currentLang.labels.logOut,
          icon: "keyboard-return",
          iconColor: colors.red,
          dangerous: true,
          onClick: () => {
            auth().signOut().then(() => {
              this.props.navigation.navigate("Auth")
            });
          }
        },
        {
          title: props.screenProps.currentLang.labels.deleteAccount,
          icon: "delete",
          iconColor: colors.red,
          opacity: auth().currentUser.providerData[0].providerId === "password" ? 1 : 0.5,
          dangerous: true,
          onClick: () => {
            if (auth().currentUser.providerData[0].providerId === "password")
              this.setState({ modalVisible: true, modalContent: "delAcc" })
            else
              ToastAndroid.show(props.screenProps.currentLang.errors.thirdPartyPassResetError, ToastAndroid.LONG);
          }
        }
      ]
    };
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    }
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

  deleteAllNotifiers = () => {
    let promiseArr = [];
    AsyncStorage.getAllKeys((err, keys) => {
      keys.forEach(key => {
        if (key.startsWith("sportsmart-notifs-" + this.state.uid)) {
          const delItemKey = key.replace("sportsmart-notifs-" + this.state.uid, "");
          PushNotification.cancelLocalNotifications({
            id: delItemKey
          });
          promiseArr.push(AsyncStorage.removeItem(key));
        }
      })
    }).then(() => {
      Promise.all(promiseArr).then(() => {
        String.prototype.format = function() {
          let args = arguments;
          return this.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != "undefined"
              ? args[number]
              : match
            ;
          });
        };
      });
    });
  }

  componentDidMount = () => {
    this._mounted = true;
  }

  componentWillUnmount = () => {
    if (this.unsubscribe) this.unsubscribe();
    this._mounted = false;
  }

  capitalize = string => {
    if (string !== null && typeof string === "string")
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  renderItem = ({ item }) => {
    return <ListItem
      containerStyle={{ backgroundColor: colors.light, opacity: item.opacity ? item.opacity : 1 }}
      title={<Text style={{ ...styles.listItemText, color: item.dangerous ? colors.red : undefined }}>{this.capitalize(item.title)}</Text>}
      rightTitle={item.value ? <Text style={{ ...styles.listItemText, opacity: 0.6 }}>{this.capitalize(item.value)}</Text> : undefined}
      leftIcon={{ type: "material", name: item.icon, color: item.iconColor, size: 30 }}
      onPress={() => {
        item.onClick();
      }}
      bottomDivider
    />
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

  handleAccountDelete = async () => {
    let passTimeoutStartDate = await AsyncStorage.getItem("sportsmart-passTimeout");
    let flag = false;
    let date = new Date();
    if (passTimeoutStartDate) {
      passTimeoutStartDate = JSON.parse(passTimeoutStartDate);
      if (date.getTime() - new Date(passTimeoutStartDate).getTime() <= this.state.currentPassTimeoutTime) {
        flag = true;
      }
    }
    if (flag) {
      const timeoutTime = date.getTime() - new Date(passTimeoutStartDate).getTime();
      if (!this.state.currentPassTimeout) {
        this.setState({ currentPassTimeout: setTimeout(() => {
          AsyncStorage.removeItem("sportsmart-passTimeout");
          if (this._mounted) this.setState({ currentPassTimeout: null, passAttempts: 0 });
        }, timeoutTime) });
      }
      this.setState({ passText: "", passError: false, modalVisible: false, modalContent: null }, () => {
        ToastAndroid.show(this.props.screenProps.currentLang.errors.tooManyAttempts, ToastAndroid.LONG);
      });
      return;
    }
    if (this.state.passAttempts >= 5 && !this.state.currentPassTimeout) {
      if (!JSON.parse(passTimeoutStartDate)) {
        AsyncStorage.setItem("sportsmart-passTimeout", JSON.stringify(new Date().toString()));
      }
      setTimeout(() => {
        AsyncStorage.removeItem("sportsmart-passTimeout");
        if (this._mounted) this.setState({ currentPassTimeout: null, passAttempts: 0 });
      }, this.state.currentPassTimeoutTime);
      this.setState({ passText: "", passError: false, modalVisible: false, modalContent: null }, () => {
        ToastAndroid.show(this.props.screenProps.currentLang.errors.tooManyAttempts, ToastAndroid.LONG);
      });
      return;
    }
    if (this.state.currentPassTimeout) {
      this.setState({ passText: "", passError: false, modalVisible: false, modalContent: null }, () => {
        ToastAndroid.show(this.props.screenProps.currentLang.errors.tooManyAttempts, ToastAndroid.LONG);
      });
      return;
    }
    if (this.state.passText === "") {
      this.setState({ passError: true }, () => {
        this.triggerError(this.props.screenProps.currentLang.errors.passEmpty);
      });
      return;
    }
    this.setState({ loading: true }, () => {
      const email = auth().currentUser.email;
      auth().currentUser.reauthenticateWithCredential(auth.EmailAuthProvider.credential(email, this.state.passText)).then(user => {
        firestore().collection("users").doc(user.user.uid).delete().then(() => {
          storage().ref("profileImages").child(user.user.uid).delete().finally(() => {
            auth().currentUser.delete().then(() => {
              this.deleteAllNotifiers();
              this.props.navigation.navigate("Auth");
            })
          });
        });
      }).catch(err => {
        if (err.message === "[auth/unknown] We have blocked all requests from this device due to unusual activity. Try again later. [ Too many unsuccessful login attempts. Please try again later. ]") {
          this.setState({ passError: true, passAttempts: 6 });
          this.triggerError(this.props.screenProps.currentLang.errors.tooManyAttempts);
        }
        this.setState({ passError: true, passAttempts: this.state.passAttempts + 1 });
        this.triggerError(this.props.screenProps.currentLang.errors.passIncorrect);
      }).finally(() => {
        this.setState({ loading: false });
      });
    });
  }

  renderModal = () => {
    switch(this.state.modalContent) {
      case "lang":
        return (
          <>
            <Dialog.Title style={styles.bigText}>{this.props.screenProps.currentLang.labels.changeLanguage}</Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group
                onValueChange={value => {
                  this.props.screenProps.changeLanguage(value, () => {
                    let newItems = this.state.items;
                    newItems[0] = { ...newItems[0], value: this.props.screenProps.currentLang.name, title: this.props.screenProps.currentLang.labels.language };
                    newItems[1] = { ...newItems[1], title: this.props.screenProps.currentLang.labels.disableAllNotifs };
                    newItems[2] = { ...newItems[2], title: this.props.screenProps.currentLang.labels.resetPass };
                    newItems[3] = { ...newItems[3], title: this.props.screenProps.currentLang.labels.logOut };
                    newItems[4] = { ...newItems[3], title: this.props.screenProps.currentLang.labels.deleteAccount };
                    this.setState({ language: value, items: newItems });
                  });
                }}
                value={this.state.language}
              >
                {this.props.screenProps.languages.map(({ name }, index) => <View key={index} style={{ flexDirection: "row", alignItems: "center" }}>
                  <View><RadioButton value={name} status={name === this.props.screenProps.currentLang.name ? "checked" : "unchecked"} /></View>
                  <Text style={styles.listItemText}>{this.capitalize(name)}</Text>
                </View>)}
              </RadioButton.Group>
            </Dialog.Content>
          </>
        );
      case "delAcc":
        return (
          <>
            <Dialog.Title style={styles.bigText}>{this.props.screenProps.currentLang.labels.confirmDeletion}</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.normalText}>{this.props.screenProps.currentLang.labels.confirmDeletionText}</Text>
              <TextInput
                autoCapitalize="none"
                textContentType="password"
                secureTextEntry={true}
                autoCorrect={false}
                error={this.state.passError}
                mode="outlined"
                label={this.props.screenProps.currentLang.labels.password}
                value={this.state.passText}
                returnKeyType="done"
                style={{ marginTop: 10 }}
                onSubmitEditing={this.handleAccountDelete}
                blurOnSubmit={false}
                onChangeText={text => this.setState({ passText: text, passError: false })}
                autoFocus
                onFocus={() => this.setState({ passError: false }, () => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                })}
                theme={{
                  colors: {
                    placeholder: colors.dark, text: colors.dark, primary: colors.dark,
                    underlineColor: "transparent", background: colors.white
                  }
                }}
              />
              {this.state.currentError !== null && <Text style={styles.error}>{this.state.currentError}</Text>}
              <Button
                titleStyle={{ color: colors.light }}
                buttonStyle={{ backgroundColor: colors.red }}
                containerStyle={{ marginTop: 20 }}
                title={this.props.screenProps.currentLang.labels.deleteAccount}
                type="solid"
                raised
                loading={this.state.loading}
                onPress={this.handleAccountDelete}
              />
            </Dialog.Content>
          </>
        )
      case "editProfile":
        return (
          <>
            <Dialog.Title style={{ ...styles.bigText, flexGrow: 1, marginTop: 10, marginBottom: 5 }}>{this.props.screenProps.currentLang.labels.editProfile}</Dialog.Title>
            <Dialog.Content style={{ flexGrow: 1 }}>
              <View style={{ flexGrow: 1, flexDirection: "row", display: "flex", marginTop: -25 }}>
                <View style={{ width: 150, height: 150, marginRight: 10, display: "flex", justifyContent: "center", alignItems: "center" }}>
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
                </View>
                <View style={{ flexGrow: 1 }}>
                  <Input
                    autoCapitalize="words"
                    textContentType="name"
                    error={this.state.nameError}
                    label={this.props.screenProps.currentLang.labels.name}
                    value={this.state.nameText}
                    returnKeyType="next"
                    containerStyle={{ margin: 0, padding: 0, marginBottom: 15, marginTop: 20 }}
                    style={{ margin: 0, padding: 0 }}
                    inputContainerStyle={{ margin: 0, padding: 0 }}
                    inputStyle={{ margin: 0, padding: 0 }}
                    labelStyle={{ margin: 0, padding: 0, marginBottom: -8 }}
                    blurOnSubmit={false}
                    onChangeText={text => this.setState({ nameText: text, nameError: false })}
                    autoFocus
                    onFocus={() => this.setState({ nameError: false }, () => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                    })}
                  />
                  <View style={{ borderRadius: 5, borderColor: colors.dark, borderWidth: 1, marginRight: 5, marginLeft: 5, height: 40 }}>
                    <Text style={{ width: 35, position: "relative", top: -11, left: 10, backgroundColor: colors.white, paddingVertical: 1, paddingHorizontal: 5 }}>Unit</Text>
                    <Picker
                      style={{ margin: 0, padding: 0, marginTop: -25 }}
                      mode="dropdown"
                      selectedValue={this.state.unit}
                      onValueChange={(itemValue) => {
                        this.setState({ unit: itemValue });
                      }}>
                      <Picker.Item label="Metric" value="metric" />
                      <Picker.Item label="Imperial" value="imperial" />
                    </Picker>
                  </View>
                </View>
              </View>
              <Input
                label={this.props.screenProps.currentLang.labels.bio}
                value={this.state.bioText}
                returnKeyType="next"
                multiline={true}
                numberOfLines={2}
                maxLength={40}
                containerStyle={{ margin: 0, padding: 0, flexGrow: 1, marginBottom: 5, marginTop: -10 }}
                style={{ margin: 0, padding: 0 }}
                inputContainerStyle={{ margin: 0, padding: 0 }}
                inputStyle={{ margin: 0, padding: 0 }}
                labelStyle={{ margin: 0, padding: 0, marginBottom: -8 }}
                blurOnSubmit={false}
                onChangeText={text => { if(this.state.bioText.length <= 40) this.setState({ bioText: text }) }}
              />
              <View style={{ flexDirection: "row", display: "flex" }}>
                <View style={{ flex: 1 }}>
                  <Input
                    keyboardType="decimal-pad"
                    error={this.state.heightError}
                    label={this.props.screenProps.currentLang.labels.height}
                    value={this.state.heightText}
                    returnKeyType="next"
                    containerStyle={{ margin: 0, padding: 0, marginBottom: 5 }}
                    style={{ margin: 0, padding: 0 }}
                    inputContainerStyle={{ margin: 0, padding: 0 }}
                    inputStyle={{ margin: 0, padding: 0 }}
                    labelStyle={{ margin: 0, padding: 0, marginBottom: -8 }}
                    blurOnSubmit={false}
                    onChangeText={text => this.setState({ heightText: text, heightError: false })}
                    onFocus={() => this.setState({ heightError: false }, () => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                    })}
                  />
                  <View style={{ position: "absolute", right: 10, top: 0, bottom: 0, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: colors.dark, fontWeight: "bold" }}>{this.state.unit === "metric" ? "CM" : "IN"}</Text>
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    keyboardType="decimal-pad"
                    error={this.state.weightError}
                    label={this.props.screenProps.currentLang.labels.weight}
                    value={this.state.weightText}
                    returnKeyType="next"
                    containerStyle={{ margin: 0, padding: 0, marginBottom: 5, flex: 1 }}
                    style={{ margin: 0, padding: 0 }}
                    inputContainerStyle={{ margin: 0, padding: 0 }}
                    inputStyle={{ margin: 0, padding: 0 }}
                    labelStyle={{ margin: 0, padding: 0, marginBottom: -8 }}
                    blurOnSubmit={false}
                    onChangeText={text => this.setState({ weightText: text, weightError: false })}
                    onFocus={() => this.setState({ weightError: false }, () => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                    })}
                  />
                  <View style={{ position: "absolute", right: 10, top: 0, bottom: 0, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ color: colors.dark, fontWeight: "bold" }}>{this.state.unit === "metric" ? "KG" : "LB"}</Text>
                  </View>
                </View>
              </View>
              <Button onPress={() => this.setState({ datePickerOpen: true })} raised titleStyle={{ textAlign: "center", color: colors.dark, fontWeight: "bold", flexGrow: 1, backgroundColor: colors.light }} buttonStyle={{ marginTop: 0, marginBottom: 0, backgroundColor: colors.light, flexGrow: 1 }} containerStyle={{ display: "flex", flexGrow: 1, borderRadius: 5, borderColor: this.state.bornError ? colors.red : "#000", borderWidth: 1, marginVertical: 10 }} title={this.ageCheck(this.state.bornText) ? this.state.bornText.toLocaleDateString(this.state.unit === "metric" ? "en-GB" : "en-US") : this.props.screenProps.currentLang.labels.born} iconContainerStyle={{ marginRight: -3 }} iconRight icon={{type: "material-community", name: "calendar", size: 20, color: colors.dark}} />
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
                titleStyle={{ color: colors.light }}
                buttonStyle={{ backgroundColor: colors.red }}
                title={this.props.screenProps.currentLang.labels.finish}
                type="solid"
                raised
                loading={this.state.loading}
              />
            </Dialog.Content>
          </>
        );
      default:
        return null;
    }
  }

  render() {
    return (
      <View style={styles.mainWrapper}>
        <Portal>
          <Dialog visible={this.state.modalVisible} onDismiss={() => this.setState({ modalVisible: false })}>
          {this.renderModal()}
          </Dialog>
        </Portal>
        <View style={{ flex: 1 }}>
          <AppHeader navigation={this.props.navigation} screenProps={this.props.screenProps} />
          <FlatList
            style={{ margin: 3 }}
            data={this.state.items}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
      <Text style={{ textAlign: "center", marginVertical: 5 }}>{this.props.screenProps.currentLang.labels.createdBy}</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainWrapper: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.light
  },
  listItemText: {
    color: colors.dark,
    fontSize: 18
  },
  bigText: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.dark,
    textAlign: "center"
  },
  normalText: {
    fontSize: 18,
    color: colors.dark
  },
  error: {
    color: colors.red,
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 15
  }
});