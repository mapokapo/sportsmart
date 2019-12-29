import React, { Component } from "react";
import { Text, FlatList, View, StyleSheet, ToastAndroid, UIManager, LayoutAnimation } from "react-native";
import AppHeader from "../../components/AppHeader";
import * as colors from "../../media/colors";
import { ListItem, Button } from "react-native-elements";
import { Portal, Dialog, RadioButton, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-community/async-storage";
import PushNotification from "react-native-push-notification";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";

export default class SettingsScreen extends Component {
  constructor(props) {
    super(props);
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
      passText: "",
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
          title: props.screenProps.currentLang.labels.disableAllNotifs,
          icon: "alarm-off",
          iconColor: colors.blue,
          onClick: () => {
            let promiseArr = [];
            AsyncStorage.getAllKeys((err, keys) => {
              keys.forEach(key => {
                if (key.startsWith("sportsmart-notifs")) {
                  const delItemKey = key.replace("sportsmart-notifs", "");
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
          dangerous: true,
          onClick: () => {
            this.setState({ modalVisible: true, modalContent: "delAcc" })
          }
        }
      ]
    };
    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  deleteAllNotifiers = () => {
    let promiseArr = [];
    AsyncStorage.getAllKeys((err, keys) => {
      keys.forEach(key => {
        if (key.startsWith("sportsmart-notifs")) {
          const delItemKey = key.replace("sportsmart-notifs", "");
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
    this._mounted = false;
  }

  capitalize = string => {
    if (string !== null && typeof string === "string")
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  renderItem = ({ item }) => {
    return <ListItem
      containerStyle={{ backgroundColor: colors.light }}
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

  keyExtractor = (item, index) => index.toString();

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
      auth().signInWithEmailAndPassword(email, this.state.passText).then(user => {
        firestore().collection("users").doc(user.user.uid).delete().then(() => {
          storage().ref("profileImages").child(user.user.uid).delete().then(() => {
            auth().currentUser.delete().then(() => {
              this.deleteAllNotifiers();
              this.props.navigation.navigate("Auth");
            })
          });
        });
      }).catch(() => {
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
                    newItems[2] = { ...newItems[2], title: this.props.screenProps.currentLang.labels.logOut };
                    newItems[3] = { ...newItems[3], title: this.props.screenProps.currentLang.labels.deleteAccount };
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
            keyExtractor={this.keyExtractor}
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
    fontSize: 20,
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