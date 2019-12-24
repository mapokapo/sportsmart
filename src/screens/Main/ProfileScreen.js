import React, { Component } from "react"
import { Text, View, ScrollView, ActivityIndicator, Dimensions, StyleSheet } from "react-native"
import { Image, Icon } from "react-native-elements";
import * as colors from "../../media/colors";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { GoogleSignin } from "@react-native-community/google-signin";
import { GraphRequest, GraphRequestManager, AccessToken } from "react-native-fbsdk";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Math.round(Dimensions.get("window").width);

export default class ProfileScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: null,
      data: {
        labels: [],
        datasets: [
          {
            data: []
          }
        ]
      }
    };
  }

  componentDidMount = () => {
    this.unsubscribe = auth().onAuthStateChanged(async user => {
      if (user) {
        if (user.providerData[0].providerId === "facebook.com") {
          const accessToken = await AccessToken.getCurrentAccessToken();
          const name = user.displayName,
            email = user.email,
            profileImage = user.metadata.photoURL;
          const infoRequest = new GraphRequest(
            "/me",
            {
              accessToken: accessToken.accessToken,
              parameters: {
                fields: {
                  string: "picture.type(large)"
                }
              }
            },
            (err, res) => {
              if (err) return;
              console.log("fb res - " + res);
              this.setState({ userData: { name, email, profileImage: res.picture.data.url } });
            }
          );

          new GraphRequestManager().addRequest(infoRequest).start();
        } else if (user.providerData[0].providerId === "google.com") {
          console.log("google res - " + user);
          this.setState({ userData: { name: user.displayName, email: user.email, profileImage: user.photoURL } });
        } else {
          getLastMonths = n => {
            const months = this.props.screenProps.currentLang.labels.months;
            let last_n_months = [];
            const date = new Date();
            for(let i = 0; i < n; i++){
              last_n_months[i] = months[date.getMonth()];
              date.setMonth(date.getMonth()-1);
            }
            last_n_months.reverse();
            return last_n_months;
          }
          firestore().collection("users").doc(user.uid).get().then(doc => {
            if (!doc.exists) {
              ToastAndroid.show(this.props.screenProps.currentLang.errors.error + ": " + this.props.screenProps.currentLang.errors.userNotFound, ToastAndroid.SHORT);
              return;
            }
            const { name, email, profileImage, gender, born, weight, height, unit, data } = doc.data();
            this.setState({ userData: { name, email, profileImage, gender, born, weight, height, unit, data }, data: { labels: getLastMonths(5), datasets: [ { data: data.map(({ kjoules }) => kjoules) } ] } });
          });
        }
      } else {
        ToastAndroid.show(this.props.screenProps.currentLang.errors.error + ": " + this.props.screenProps.currentLang.errors.userNotFound, ToastAndroid.SHORT);
      }
    });
    GoogleSignin.configure({
      webClientId: '373206170368-e8jrbu94tgslrel2h8ar0835pkc2jl37.apps.googleusercontent.com',
      offlineAccess: true,
      forceConsentPrompt: true
    });
  }

  componentWillUnmount = () => {
    this.unsubscribe();
  }

  capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
                    style={{ width: 160, height: 160 }}
                    containerStyle={{ overflow: "hidden", borderRadius: 160/2, elevation: 1, width: 160, height: 160 }}
                  />
                </View>
                {this.state.userData.gender && (<View style={{ flex: 1, justifyContent: "center"}}>
                  <Text style={styles.profileTextBig}>{this.state.userData.name}</Text>
                  <Text style={styles.profileText}>{this.state.userData.email}</Text>
                  <Text style={styles.profileText}>{this.state.userData.born}</Text>
                  <View style={{ flexDirection: "row" }}><Icon type="material-community" name="medal" size={30} color="gold" /></View>
                </View>)}
              </>)
            }
          </View>
          {this.state.userData === null ? 
              <ActivityIndicator size="large" color={colors.dark} />
              :
              (<>
                <View style={{ flex: 2, backgroundColor: colors.dark }}>
                  <View style={{ width: "100%", backgroundColor: colors.light, display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
                    <Text style={{ ...styles.profileTextBig, flex: 1, textAlign: "center", paddingVertical: 10, borderRightColor: colors.dark, borderRightWidth: StyleSheet.hairlineWidth }}>{this.props.screenProps.currentLang.labels.gender[this.state.userData.gender]}</Text>
                    <Text style={{ ...styles.profileTextBig, flex: 1, textAlign: "center", paddingVertical: 10, borderRightColor: colors.dark, borderRightWidth: StyleSheet.hairlineWidth }}>{this.state.userData.weight}{this.state.userData.unit === "metric" ? "kg" : "lb"}</Text>
                    <Text style={{ ...styles.profileTextBig, flex: 1, textAlign: "center", paddingVertical: 10 }}>{this.state.userData.height}{this.state.userData.unit === "metric" ? "cm" : "in"}</Text>
                  </View>
                  {this.state.userData && this.state.data && (<View style={{ height: 220, width: screenWidth, elevation: 2 }}>
                    <Text style={{ color: colors.light, fontSize: 32, textAlign: "center", marginTop: 15 }}>{this.props.screenProps.currentLang.labels.activityPerMonth}</Text>
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
                  </View>)}
                </View>
              </>)
            }
        </View>
      </ScrollView>
    )
  }
}

const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const styles = StyleSheet.create({
  profileTextBig: {
    color: colors.dark,
    fontSize: 32
  },
  profileText: {
    color: colors.dark,
    fontSize: 24,
    opacity: 0.75
  }
})