import React, { Component } from "react"
import { Text, View, ScrollView, ActivityIndicator, Dimensions, StyleSheet, ToastAndroid } from "react-native"
import { Image, Icon } from "react-native-elements";
import { ProgressBar } from "react-native-paper";
import * as colors from "../../media/colors";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { GraphRequest, GraphRequestManager } from "react-native-fbsdk";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Math.round(Dimensions.get("window").width);

export default class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: null,
      iconClicked: false,
      data: undefined,
      medals: []
    };
  }

  componentDidMount = () => {
    this.unsubscribe = auth().onAuthStateChanged(async user => {
      if (user) {
        if (user.providerData[0].providerId === "facebook.com") {
          const infoRequest = new GraphRequest(
            "/me?fields=name,email,picture.type(large)",
            null,
            (err, res) => {
              if (err) return;
              this.setState({ userData: { name: res.name, email: res.email, profileImage: res.picture.data.url } });
            }
          );
          new GraphRequestManager().addRequest(infoRequest).start();
        } else if (user.providerData[0].providerId === "google.com") {
          this.setState({ userData: { name: user.displayName, email: user.email, profileImage: user.photoURL } });
        } else {
          let getLastDays = n => {
            const days = this.props.screenProps.currentLang.labels.days;
            let last_n_days = [];
            const date = new Date();
            for(let i = 0; i < n; i++){
              last_n_days[i] = days[date.getDay()];
              date.setDate(date.getDate()-1);
            }
            last_n_days.reverse();
            return last_n_days;
          }
          firestore().collection("users").doc(user.uid).get().then(doc => {
            if (!doc.exists) {
              ToastAndroid.show(this.props.screenProps.currentLang.errors.error + ": " + this.props.screenProps.currentLang.errors.userNotFound, ToastAndroid.SHORT);
              return;
            }
            const { name, email, profileImage, gender, born, weight, height, unit, data } = doc.data();
            const activity = data ? data.map(({ kjoules }) => kjoules) : [];
            if (activity[activity.length - 1] > 2000) {
              const total = activity[activity.length - 1];
              function pushToArray(arr, obj) {
                const index = arr.findIndex((e) => e.value === obj.value);
                if (index === -1) {
                    arr.push(obj);
                } else {
                    arr[index] = obj;
                }
              }
              let medals = this.state.medals;
              pushToArray(medals, { icon: require("../../media/Medalje_01.png"), value: total })
              this.setState({ medals });
            }
            this.setState({ userData: { name, email, profileImage, gender, born, weight, height, unit, data }, data: data ? { labels: getLastDays(5), datasets: [ { data: data.map(({ kjoules }) => kjoules) } ] } : undefined });
          });
        }
      } else {
        ToastAndroid.show(this.props.screenProps.currentLang.errors.error + ": " + this.props.screenProps.currentLang.errors.userNotFound, ToastAndroid.SHORT);
      }
    });
  }

  componentWillUnmount = () => {
    if (this.unsubscribe) this.unsubscribe();
  }

  capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  refreshData = () => {
    this.setState({ data: null, iconClicked: true }, () => {
      const user = auth().currentUser;
      let getLastDays = n => {
        const days = this.props.screenProps.currentLang.labels.days;
        let last_n_days = [];
        const date = new Date();
        for(let i = 0; i < n; i++){
          last_n_days[i] = days[date.getDay()];
          date.setDate(date.getDate()-1);
        }
        last_n_days.reverse();
        return last_n_days;
      }
      firestore().collection("users").doc(user.uid).get().then(doc => {
        if (!doc.exists) {
          ToastAndroid.show(this.props.screenProps.currentLang.errors.error + ": " + this.props.screenProps.currentLang.errors.userNotFound, ToastAndroid.SHORT);
          return;
        }
        const { name, email, profileImage, gender, born, weight, height, unit, data } = doc.data();
        const activity = data ? data.map(({ kjoules }) => kjoules) : [];
        if (activity[activity.length - 1] > 2000) {
          const total = activity[activity.length - 1];
          function pushToArray(arr, obj) {
            const index = arr.findIndex((e) => e.value === obj.value);
            if (index === -1) {
                arr.push(obj);
            } else {
                arr[index] = obj;
            }
          }
          let medals = this.state.medals;
          pushToArray(medals, { icon: require("../../media/Medalje_01.png"), value: total })
          this.setState({ medals });
        }
        this.setState({ userData: { name, email, profileImage, gender, born, weight, height, unit, data }, data: data ? { labels: getLastDays(5), datasets: [ { data: data.map(({ kjoules }) => kjoules) } ] } : undefined });
        setTimeout(() => this.setState({ iconClicked: false }), 600);
      });
    });
  }

  render() {
    return (
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View style={{ display: "flex", justifyContent: "center", flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: colors.light, display: "flex", flexDirection: "row", justifyContent: "center", elevation: 1 }}>
            {this.state.userData === null ? 
              <ActivityIndicator size="large" color={colors.dark} />
              :
              (<>
                <View style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Image
                    source={{ uri: this.state.userData.profileImage }}
                    style={{ width: 140, height: 140 }}
                    containerStyle={{ overflow: "hidden", borderRadius: 140/2, elevation: 1, width: 140, height: 140 }}
                  />
                </View>
                <View style={{ flex: 1, justifyContent: "center"}}>
                  <Text style={styles.profileTextBig}>{this.state.userData.name}</Text>
                  <Text style={styles.profileText}>{this.state.userData.email}</Text>
                  {this.state.userData.born && (<Text style={styles.profileText}>{this.state.userData.born}</Text>)}
                  {!this.state.iconClicked ? (<View style={{ flexDirection: "row" }}>{this.state.medals.map((medal, index) => (<Image key={index} style={{ width: 21, height: 33, marginHorizontal: 5 }} source={medal.icon} />))}
                  </View>) : <ActivityIndicator style={{ width: 21, height: 33, marginHorizontal: 5 }} size="small" color={colors.dark} />}
                </View>
              </>)
            }
          </View>
          {this.state.userData === null ? 
            <ActivityIndicator size="large" color={colors.dark} />
            :
            (<>
              <View style={{ flex: 2, backgroundColor: colors.dark }}>
                {this.state.userData.gender && (<View style={{ width: "100%", backgroundColor: colors.light, display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
                  <Text style={{ ...styles.profileTextBig, flex: 1, textAlign: "center", paddingVertical: 10, borderRightColor: colors.dark, borderRightWidth: StyleSheet.hairlineWidth }}>{this.props.screenProps.currentLang.labels.gender[this.state.userData.gender]}</Text>
                  <Text style={{ ...styles.profileTextBig, flex: 1, textAlign: "center", paddingVertical: 10, borderRightColor: colors.dark, borderRightWidth: StyleSheet.hairlineWidth }}>{this.state.userData.weight}{this.state.userData.unit === "metric" ? "kg" : "lb"}</Text>
                  <Text style={{ ...styles.profileTextBig, flex: 1, textAlign: "center", paddingVertical: 10 }}>{this.state.userData.height}{this.state.userData.unit === "metric" ? "cm" : "in"}</Text>
                </View>)}
                {this.state.userData && this.state.data && !this.state.iconClicked ? (
                  <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 15 }}>
                    <Text style={{ color: colors.light, fontSize: 28, textAlign: "center", marginBottom: -12, marginTop: -10 }}>{this.props.screenProps.currentLang.labels.activityPerDay}</Text>
                    <ProgressBar
                      color={colors.red}
                      progress={this.state.userData.data[this.state.userData.data.length - 1].kjoules / 10000}
                      style={{ width: screenWidth/1.5, marginBottom: -15 }}
                    />
                    {this.state.userData.gender && (
                      <Icon name="refresh" onPress={() => this.refreshData()} color={colors.blue} size={28} iconStyle={{ backgroundColor: colors.dark }} containerStyle={{ position: "absolute", right: 14 }} />
                    )}
                  </View>
                ) : (this.state.iconClicked === true ? (
                    <View style={{ height: 220, width: screenWidth, alignItems: "center", justifyContent: "center" }}>
                      <ActivityIndicator size="large" color={colors.blue} />
                    </View>
                  ) : (this.state.userData.gender && (
                      <View style={{ height: 220, width: screenWidth, elevation: 2, flexDirection: "row", opacity: 0.75, marginTop: "auto", flexWrap: "wrap", alignItems: "center", justifyContent: "center", paddingHorizontal: 15 }}>
                      </View>
                    )
                  )
                )}
                {this.state.userData && this.state.data && !this.state.iconClicked ? (<View style={{ height: 220, width: screenWidth, elevation: 2 }}>
                  <LineChart
                    bezier
                    data={this.state.data}
                    width={screenWidth}
                    height={220}
                    style={{ borderRadius: 10, margin: 15 }}
                    getDotProps={(data, index) => {
                      return {
                        r: 5,
                        fill: index === 4 ? "rgba(243, 54, 54, 1)" : "rgba(216, 232, 240, 0.85)"
                      };
                    }}
                    chartConfig={{
                      backgroundGradientFrom: colors.blue,
                      backgroundGradientFromOpacity: 0.05,
                      backgroundGradientTo: colors.dark,
                      backgroundGradientToOpacity: 1,
                      color: (opacity = 1) => `rgba(216, 232, 240, ${opacity})`
                    }}
                  />
                </View>) : (this.state.iconClicked === true ? (<View style={{ height: 220, width: screenWidth, alignItems: "center", justifyContent: "center" }}><ActivityIndicator size="large" color={colors.blue} /></View>) : (this.state.userData.gender ? (<View style={{ height: 220, width: screenWidth, elevation: 2, flexDirection: "row", opacity: 0.75, marginTop: "auto", flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ textAlign: "center", fontSize: 20, color: colors.light }}>{this.props.screenProps.currentLang.labels.noData1}</Text><Icon color={colors.light} size={24} type="material-community" name="run" /><Text style={{ textAlign: "center", fontSize: 20, color: colors.light }}>{this.props.screenProps.currentLang.labels.noData2}</Text>
                </View>) : (<View style={{ height: 220, width: screenWidth, elevation: 2, flexDirection: "row", opacity: 0.75, marginTop: "auto", flexWrap: "wrap", alignItems: "center", justifyContent: "center", paddingHorizontal: 15 }}>
                <Text style={{ textAlign: "center", fontSize: 20, color: colors.light }}>{this.props.screenProps.currentLang.errors.thirdPartyPassResetError}</Text>
                </View>)))}
              </View>
            </>)
          }
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  profileTextBig: {
    color: colors.dark,
    fontSize: 32
  },
  profileText: {
    color: colors.dark,
    fontSize: 16,
    opacity: 0.75
  }
});