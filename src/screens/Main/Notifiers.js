import React, { Component } from "react";
import AsyncStorage from "@react-native-community/async-storage";
import { Text, View, FlatList, Switch, LayoutAnimation, UIManager, ToastAndroid } from "react-native";
import { ListItem, Button } from "react-native-elements";
import * as colors from "../../media/colors";
import { Dialog, Portal, TextInput, FAB } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import PushNotification from "react-native-push-notification";

var counter = -1;

class NotifiersScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentError: null,
      currentTimeout: null,
      editing: -1,
      editVisible: false,
      datePickerVisible: false,
      timeText: new Date(null),
      timeError: false,
      itemID: -1,
      descText: "",
      activeBool: false,
      notifiers: []
    };

    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    Date.prototype.addDays = function(days) {
      var date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    }
  }

  componentDidMount = () => {
    AsyncStorage.getAllKeys((err1, keys) => {
      for (let i = 0; i < keys.length; i++) {
        if (keys[i].startsWith("sportsmart-notifs")) {
          AsyncStorage.getItem(keys[i], (err2, value) => {
            if (value) {
              let data = JSON.parse(value);
              data.time = new Date(data.time);
              this.setState({ notifiers: [ ...this.state.notifiers, data ] });
            }
          })
        }
      }
    })
    PushNotification.configure({    
      onNotification: function({ foreground, userInteraction }) {
        if (foreground && userInteraction) {
          this.props.navigation.navigate("Running");
        }
      },
      popInitialNotification: true,
      requestPermissions: true
    });
  }

  timeCheck = (time) => {
    return time.getTime() !== 0;
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

  getTimeToAlarm = item => {
    let now = Date.now();
    let currentTime = new Date(now);
    let futureTime = new Date(now);
    if (item) {
      futureTime.setHours(item.time.getHours(), item.time.getMinutes());
    } else {
      futureTime.setHours(this.state.timeText.getHours(), this.state.timeText.getMinutes());
    }
    if (futureTime.getTime() < currentTime.getTime()) {
      futureTime.setDate(futureTime.getDate() + 1);
    }
    let difference = (futureTime - currentTime) / 1000;
    return Number(difference);
  }

  secondsToHms = d => {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);

    const hDisplay = h > 0 ? h : "0";
    const mDisplay = m > 0 ? m : "0";
    const sDisplay = s > 0 ? s : "0";
    return {
      h: hDisplay,
      m: mDisplay,
      s: sDisplay
    }; 
  }

  addItem = () => {
    if (!this.timeCheck(this.state.timeText)) {
      this.setState({ timeError: true }, () => {
        this.triggerError(this.props.screenProps.currentLang.errors.timeEmpty);
      })
      return;
    }
    for (let item in this.state.notifiers) {
      if (this.state.notifiers[item].id === this.state.editing) {
        let newItem = this.state.notifiers[item];
        newItem.active = this.state.activeBool;
        newItem.description = this.state.descText;
        newItem.time = this.state.timeText;
        let objArray = this.state.notifiers;
        objArray[item] = newItem;
        this.setState({ notifiers: objArray, editVisible: false }, () => {
          AsyncStorage.setItem("sportsmart-notifs" + this.state.itemID, JSON.stringify(newItem));
          if (this.state.activeBool) {
            let seconds = this.getTimeToAlarm();
            setTimeout(() => {
              PushNotification.localNotificationSchedule({
                id: this.state.itemID,
                number: 0,
                userInfo: {
                  id: this.state.itemID
                },
                bigText: "Alarm has expired. Start running!",
                vibrate: true,
                vibration: 300,
                ongoing: false,
                title: "Sportsmart Alarm",
                message: "Sportsmart",
                playSound: true,
                soundName: "sportsmart_notification.mp3",
                date: new Date(Date.now() + seconds * 1000)
              });
              String.prototype.format = function() {
                let args = arguments;
                return this.replace(/{(\d+)}/g, function(match, number) { 
                  return typeof args[number] != "undefined"
                    ? args[number]
                    : match
                  ;
                });
              };
              let secsToTime = this.secondsToHms(seconds);
              ToastAndroid.show(this.props.screenProps.currentLang.labels.alarmSet.toString().format(secsToTime.h, secsToTime.m), ToastAndroid.SHORT);
            }, 500);
          }
        });
        return;
      }
    }
    this.setState({ notifiers: [...this.state.notifiers, { itemID: this.state.itemID, time: this.state.timeText, description: this.state.descText, active: this.state.activeBool, id: ++counter }], editVisible: false }, () => {
      AsyncStorage.setItem("sportsmart-notifs" + this.state.itemID, JSON.stringify({ id: this.state.itemID, time: this.state.timeText, description: this.state.descText, active: this.state.activeBool, id: ++counter }));
      let seconds = this.getTimeToAlarm();
      setTimeout(() => {
        PushNotification.localNotificationSchedule({
          id: this.state.itemID,
          number: 0,
          userInfo: {
            id: this.state.itemID
          },
          bigText: "Alarm has expired. Start running!",
          vibrate: true,
          vibration: 300,
          ongoing: false,
          title: "Sportsmart Alarm",
          message: "Sportsmart",
          playSound: true,
          soundName: "sportsmart_notification.mp3",
          date: new Date(Date.now() + seconds * 1000)
        });
        String.prototype.format = function() {
          let args = arguments;
          return this.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != "undefined"
              ? args[number]
              : match
            ;
          });
        };
        let secsToTime = this.secondsToHms(seconds);
        ToastAndroid.show(this.props.screenProps.currentLang.labels.alarmSet.toString().format(secsToTime.h, secsToTime.m), ToastAndroid.SHORT);
      }, 500);
    });
  }

  deleteItem = () => {
    let newObj = this.state.notifiers;
    function search(nameKey, prop, myArray){
      for (let i=0; i < myArray.length; i++) {
        if (myArray[i][prop] === nameKey) {
            return myArray[i];
        }
      }
    }
    let delItem = search(this.state.editing, "id", this.state.notifiers);
    PushNotification.cancelLocalNotifications({
      id: delItem.itemID
    });
    newObj = newObj.filter(obj => obj.id !== this.state.editing);
    this.setState({ notifiers: newObj, editVisible: false });
    AsyncStorage.removeItem("sportsmart-notifs" + delItem.itemID);
  }

  render() {
    return (
      <>
        <Portal>
          <Dialog visible={this.state.editVisible} onDismiss={() => this.setState({ editVisible: false })}>
            <Dialog.Title>{this.props.screenProps.currentLang.labels.createNotifier}</Dialog.Title>
            <Dialog.Content>
            <TextInput
              autoCapitalize="words"
              mode="outlined"
              label={this.props.screenProps.currentLang.labels.description}
              value={this.state.descText}
              onChangeText={text => this.setState({ descText: text })}
              blurOnSubmit={false}
              returnKeyType="next"
              theme={{
                colors: {
                  placeholder: colors.dark, text: colors.dark, primary: colors.dark,
                  underlineColor: "transparent", background: colors.white
                }
              }}
            />
            <Button onPress={() => this.setState({ datePickerVisible: true })} raised titleStyle={{ color: colors.dark, fontWeight: "bold", flex: 1, backgroundColor: colors.light, fontSize: 20 }} buttonStyle={{ backgroundColor: colors.light }} containerStyle={{ borderRadius: 5, borderColor: this.state.timeError ? colors.red : "#000", borderWidth: 1, marginTop: 30 }} title={this.timeCheck(this.state.timeText) ? (this.state.timeText.getHours() < 10 ? "0" + this.state.timeText.getHours() : this.state.timeText.getHours()) + ":" + (this.state.timeText.getMinutes() < 10 ? "0" + this.state.timeText.getMinutes() : this.state.timeText.getMinutes()) : this.props.screenProps.currentLang.labels.time} iconRight icon={{type: "material-community", name: "clock", size: 24, color: colors.dark}} />
            {this.state.datePickerVisible && (<DateTimePicker
              value={this.state.timeText}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={(event, date) => {
                if (event.type !== "dismissed") {
                  date.setSeconds(0);
                  date.setMilliseconds(0);
                  this.setState({ timeText: date, datePickerVisible: false })
                } else this.setState({ datePickerVisible: false });
              }}
              onDismiss={() => this.setState({ datePickerVisible: false })}
            />)}
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-around", alignItems: "center", marginTop: 15 }}>
              <Switch
                style={{ transform: [{ scale: 1.25 }] }}
                thumbColor={this.state.activeBool ? colors.red : colors.light}
                trackColor={{false: "#333", true: "#a33"}}
                value={this.state.activeBool}
                onValueChange={value => this.setState({ activeBool: value })}
              />
              {this.state.editing !== -1 && (<Button onPress={() => this.deleteItem()} title={this.props.screenProps.currentLang.labels.delete} buttonStyle={{ backgroundColor: colors.red, borderRadius: 5 }} iconRight icon={{ name: "delete", size: 24, color: colors.light }} />)}
            </View>
            {this.state.currentError !== null && <Text style={{ color: colors.red, fontSize: 16, textAlign: "center", marginVertical: 5, lineHeight: 15 }}>{this.state.currentError}</Text>}
            <Button onPress={() => this.addItem()} titleStyle={{ color: colors.dark, fontWeight: "bold", flex: 1, backgroundColor: colors.red, fontSize: 20 }} buttonStyle={{ backgroundColor: colors.red }} containerStyle={{ marginTop: 15 }} title={this.props.screenProps.currentLang.labels.finish} iconRight icon={{type: "material-community", name: "check-bold", size: 24, color: colors.dark}} />
            </Dialog.Content>
          </Dialog>
        </Portal>
        <FlatList
          style={{
            backgroundColor: colors.dark,
            paddingVertical: 5
          }}
          ListEmptyComponent={<Text style={{ color: colors.light, fontSize: 18, textAlign: "center", opacity: 0.6, marginTop: 15 }}>{this.props.screenProps.currentLang.labels.noNotifiers}</Text>}
          data={this.state.notifiers}
          renderItem={({item, index}) => (
            <ListItem
              leftIcon={{ name: "edit", color: colors.light, size: 36, containerStyle: { padding: 0, marginHorizontal: -5 } }}
              key={index}
              title={(Number(item.time.getHours()) < 10 ? "0" + item.time.getHours() : item.time.getHours()) + ":" + (item.time.getMinutes() < 10 ? "0" + item.time.getMinutes() : item.time.getMinutes())}
              titleStyle={{
                color: colors.light,
                fontSize: 36,
                padding: 0,
                margin: 0
              }}
              subtitleStyle={{
                color: colors.light,
                fontSize: 24,
                opacity: 0.75,
                padding: 0,
                margin: 0
              }}
              containerStyle={{
                backgroundColor: colors.dark,
                paddingVertical: item.description === "" ? 30 : 15
              }}
              subtitle={item.description !== "" ? item.description : null}
              bottomDivider
              switch={{
                style: { transform: [{ scale: 1.25 }] },
                thumbColor: item.active ? colors.red : colors.light,
                trackColor: {false: "#333", true: "#a33"},
                value: item.active,
                onValueChange: value => {
                  this.setState(prevState => ({notifiers: prevState.notifiers.map((obj, objIndex) => (objIndex === index ? Object.assign(obj, { active: value }) : obj))}), () => {
                    AsyncStorage.setItem("sportsmart-notifs" + item.itemID);
                    if (value) {
                      let seconds = this.getTimeToAlarm(item);
                      PushNotification.localNotificationSchedule({
                        bigText: "Alarm has expired. Start running!",
                        number: 0,
                        userInfo: {
                          id: this.state.itemID
                        },
                        vibrate: true,
                        vibration: 300,
                        ongoing: false,
                        title: "Sportsmart Alarm",
                        message: "Sportsmart",
                        playSound: true,
                        soundName: "sportsmart_notification.mp3",
                        date: new Date(Date.now() + seconds * 1000)
                      });
                      String.prototype.format = function() {
                        let args = arguments;
                        return this.replace(/{(\d+)}/g, function(match, number) { 
                          return typeof args[number] != "undefined"
                            ? args[number]
                            : match
                          ;
                        });
                      };
                      let secsToTime = this.secondsToHms(seconds);
                      ToastAndroid.show(this.props.screenProps.currentLang.labels.alarmSet.toString().format(secsToTime.h, secsToTime.m), ToastAndroid.SHORT);
                    } else {
                      PushNotification.cancelLocalNotifications({
                        id: item.itemID
                      })
                    }
                  });
                }
              }}
              onPress={() => {
                let time = new Date();
                time.setHours(item.time.getHours());
                time.setMinutes(item.time.getMinutes());
                time.setSeconds(0);
                time.setMilliseconds(0);
                this.setState({ editVisible: true, timeText: time, descText: item.description, activeBool: item.active, editing: item.id, itemID: item.itemID });
              }}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <FAB
          style={{ backgroundColor: colors.red, color: colors.dark, position: "absolute", right: 30, bottom: 30 }}
          icon="add"
          onPress={() => {this.setState({ editVisible: true, timeText: new Date(null), descText: "", activeBool: false, editing: -1, itemID: (Math.floor(Math.random() * 100)).toString() }); PushNotification.requestPermissions([ "alert", "badge", "sound" ])}}
        />
      </>
    )
  }
}

export default NotifiersScreen;