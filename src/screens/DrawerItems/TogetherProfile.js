import React, { Component } from "react"
import { Text, View, ScrollView, ActivityIndicator, Dimensions, StyleSheet, ToastAndroid } from "react-native"
import { Image, Icon } from "react-native-elements";
import { ProgressBar } from "react-native-paper";
import * as colors from "../../media/colors";
import firestore from "@react-native-firebase/firestore";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Math.round(Dimensions.get("window").width);

export default class TogetherProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: null,
      iconClicked: false,
      data: undefined,
      medals: [],
      progress: 0,
      userActivity: 0
    };
  }

  componentDidMount = () => {
    firestore().collection("users").doc(this.props.navigation.getParam("userItem").item.uid).get().then(doc => {
      if (!doc.exists) {
        ToastAndroid.show(this.props.screenProps.currentLang.errors.error + ": " + this.props.screenProps.currentLang.errors.userNotFound, ToastAndroid.SHORT);
        return;
      }
      const { name, email, profileImage, gender, born, weight, height, unit } = this.props.navigation.getParam("userItem").item;
      const { data } = doc.data();
      const getAge = dateString => {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
      }
      const age = getAge(born);
      let v;
      if (gender === "male") {
        if (unit === "metric") v = 66.5 + (13.75 * weight) + (5.003 * height) - (6.775 * age);
        else v = 65 + (6.2 * weight) + (12.7 * height) - (6.8 * age);
      }else {
        if (unit === "metric") v = 655.1 + (9.563 * weight) + (1.85 * height) - (4.676 * age);
        else v = 655 + (4.3 * weight) + (4.7 * height) - (4.7 * age);
      }
      function dateDiffInHours(a, b) {
        return Math.abs(b - a) / 36e5;
      }
      const activity = data ? data.map(({ kcal }) => kcal) : [];
      const activity2 = data ? data.map(({ duration }) => duration) : [];
      const activity3 = data ? data.map(({ distance }) => distance) : [];
      let medals = this.state.medals;
      function pushToArray(arr, obj) {
        const index = arr.findIndex((e) => e.value === obj.value);
        if (index === -1) {
            arr.push(obj);
        } else {
            arr[index] = obj;
        }
      }
      if (activity[activity.length - 1] > v) {
        const total = activity[activity.length - 1];
        pushToArray(medals, { icon: require("../../media/activity_medal.png"), value: total });
      }
      if (activity2[activity2.length - 1] > 3600) {
        const total = activity2[activity2.length - 1];
        pushToArray(medals, { icon: require("../../media/stamina_medal.png"), value: total });
      }
      if (activity3[activity3.length - 1] > 10) {
        const total = activity3[activity3.length - 1];
        pushToArray(medals, { icon: require("../../media/distance_medal.png"), value: total });
      }
      this.setState({ medals: data && dateDiffInHours(new Date(data[data.length - 1].date), new Date()) < 24 ? medals : [], bmr: v, userData: { name, email, profileImage, gender, born, weight, height, unit, data }, data: data ? { labels: data.map(obj => {
        return this.props.screenProps.currentLang.labels.days[new Date(obj.date).getDay()];
      }), datasets: [ { data: data.map(({ kjoules }) => kjoules) } ] } : undefined }, () => {
        if (this.state.userData.data) {
          const currentDate = new Date();
          const activityDate = new Date(this.state.userData.data[this.state.userData.data.length - 1].date);
          this.setState({ userActivity: dateDiffInHours(activityDate, currentDate) < 24 ? this.state.userData.data[this.state.userData.data.length - 1].kcal : 0, progress: dateDiffInHours(activityDate, currentDate) < 24 ? this.state.userData.data[this.state.userData.data.length - 1].kcal / this.state.bmr : 0 });
        }
      });
    });
  }

  capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  refreshData = () => {
    this.setState({ data: null, iconClicked: true }, () => {
      firestore().collection("users").doc(this.props.navigation.getParam("userItem").item.uid).get().then(doc => {
        if (!doc.exists) {
          ToastAndroid.show(this.props.screenProps.currentLang.errors.error + ": " + this.props.screenProps.currentLang.errors.userNotFound, ToastAndroid.SHORT);
          return;
        }
        const { name, email, profileImage, gender, born, weight, height, unit } = this.props.navigation.getParam("userItem").item;
        const { data } = doc.data();
        const getAge = dateString => {
          var today = new Date();
          var birthDate = new Date(dateString);
          var age = today.getFullYear() - birthDate.getFullYear();
          var m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
              age--;
          }
          return age;
        }
        const age = getAge(born);
        let v;
        if (gender === "male") {
          if (unit === "metric") v = 66.5 + (13.75 * weight) + (5.003 * height) - (6.775 * age);
          else v = 65 + (6.2 * weight) + (12.7 * height) - (6.8 * age);
        }else {
          if (unit === "metric") v = 655.1 + (9.563 * weight) + (1.85 * height) - (4.676 * age);
          else v = 655 + (4.3 * weight) + (4.7 * height) - (4.7 * age);
        }
        function dateDiffInHours(a, b) {
          return Math.abs(b - a) / 36e5;
        }
        const activity = data ? data.map(({ kcal }) => kcal) : [];
        const activity2 = data ? data.map(({ duration }) => duration) : [];
        const activity3 = data ? data.map(({ distance }) => distance) : [];
        let medals = this.state.medals;
        function pushToArray(arr, obj) {
          const index = arr.findIndex((e) => e.value === obj.value);
          if (index === -1) {
              arr.push(obj);
          } else {
              arr[index] = obj;
          }
        }
        if (activity[activity.length - 1] > v) {
          const total = activity[activity.length - 1];
          pushToArray(medals, { icon: require("../../media/activity_medal.png"), value: total });
        }
        if (activity2[activity2.length - 1] > 3600) {
          const total = activity2[activity2.length - 1];
          pushToArray(medals, { icon: require("../../media/stamina_medal.png"), value: total });
        }
        if (activity3[activity3.length - 1] > 10) {
          const total = activity3[activity3.length - 1];
          pushToArray(medals, { icon: require("../../media/distance_medal.png"), value: total });
        }
        this.setState({ medals: data && dateDiffInHours(new Date(data[data.length - 1].date), new Date()) < 24 ? medals : [], bmr: v, userData: { name, email, profileImage, gender, born, weight, height, unit, data }, data: data ? { labels: data.map(obj => {
          return this.props.screenProps.currentLang.labels.days[new Date(obj.date).getDay()];
        }), datasets: [ { data: data.map(({ kjoules }) => kjoules) } ] } : undefined }, () => {
          if (this.state.userData.data) {
            const currentDate = new Date();
            const activityDate = new Date(this.state.userData.data[this.state.userData.data.length - 1].date);
            this.setState({ userActivity: dateDiffInHours(activityDate, currentDate) < 24 ? this.state.userData.data[this.state.userData.data.length - 1].kcal : 0, progress: dateDiffInHours(activityDate, currentDate) < 24 ? this.state.userData.data[this.state.userData.data.length - 1].kcal / this.state.bmr : 0 });
          }
        });
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
                  {!this.state.iconClicked ? (<View style={{ flexDirection: "row", marginBottom: 5 }}>{this.state.medals.map((medal, index) => (<Image key={index} style={{ width: 23, height: 29, marginHorizontal: 5 }} source={medal.icon} />))}
                  </View>) : <ActivityIndicator style={{ width: 23, height: 29, marginHorizontal: 5 }} size="small" color={colors.dark} />}
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
                {this.state.userData && !this.state.iconClicked ? (
                  <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: 15 }}>
                    <Text style={{ color: colors.light, fontSize: 28, textAlign: "center", marginBottom: -12, marginTop: -10 }}>{this.props.screenProps.currentLang.labels.activityPerDay}</Text>
                    {this.state.data && (<>
                      <ProgressBar
                        color={this.state.progress >= 1 ? colors.light : (this.state.progress >= 0.5 && this.state.progress < 1 ? colors.blue : colors.red)}
                        progress={this.state.progress}
                        style={{ width: screenWidth/1.5, marginBottom: -15 }}
                      />
                      <View style={{ flexDirection: "row" }}><Text style={{ color: this.state.progress >= 1 ? colors.light : (this.state.progress >= 0.5 && this.state.progress < 1 ? colors.blue : colors.red), fontSize: 16, textAlign: "center" }}>{this.state.userActivity}</Text><Text style={{ color: colors.light, fontSize: 16, textAlign: "center" }}> / {Math.round(this.state.bmr)}</Text></View>
                    </>)}
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