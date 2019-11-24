import React, { Component } from "react";
import { Dimensions, View, StyleSheet, ScrollView, PermissionsAndroid, Text } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Button } from "react-native-elements";
import * as colors from "../../media/colors";
import Geolocation from "react-native-geolocation-service";
import languages from "../../media/languages";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const screenWidth = Math.round(Dimensions.get("window").width);
const screenHeight = Math.round(Dimensions.get("window").height);

export default class RunningScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startedRunning: false,
      mapLoaded: false,
      userData: null,
      locationPermission: false,
      duration: 0,
      position: {
        currentLat: 0,
        currentLong: 0,
        coordArray: [],
        distance: 0,
        prevCoords: {},
        intitialCoords: null
      }
    };
  }

  calcDistance = newLatLng => {
    const RADII = {
      km:    6371,
      mile:  3960,
      meter: 6371000,
      nmi:   3440
    }
  
    // convert to radians
    const toRad = function (num) {
      return num * Math.PI / 180;
    }
  
    function haversine (startCoordinates, endCoordinates, options) {
      options = options || {};
  
      const R = options.unit in RADII ? RADII[options.unit] : RADII.km;
  
      const dLat = toRad(endCoordinates.latitude - startCoordinates.latitude);
      const dLon = toRad(endCoordinates.longitude - startCoordinates.longitude);
      const lat1 = toRad(startCoordinates.latitude);
      const lat2 = toRad(endCoordinates.latitude);
  
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
      return R * c;
    }
    return haversine(this.state.position.prevCoords, newLatLng, { unit: this.state.userData ? this.state.userData.unit : "km" }) || 0;
  };

  requestLocationPermission = () => new Promise(async (resolve, reject) => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: languages.currentLang.labels.locationPermissionTitle,
          message: languages.currentLang.labels.locationPermissionText,
          buttonPositive: "OK",
        },
      );
      this.setState({ locationPermission: granted === PermissionsAndroid.RESULTS.GRANTED }, () => {
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });

  mapPrepare() {
    this.watchID = Geolocation.watchPosition(
      position => {
        let newCoordinate = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        this.setState({
          position: {
            currentLat: position.coords.latitude,
            currentLong: position.coords.longitude,
            coordArray: this.state.startedRunning ? this.state.position.coordArray.concat([newCoordinate]) : [newCoordinate],
            prevCoords: newCoordinate,
            distance: this.state.position.distance + this.state.startedRunning ? this.calcDistance(newCoordinate) : 0,
            intitialCoords: this.state.startedRunning ? this.state.position.intitialCoords : newCoordinate
          }
        }, () => {
          this.state.mapLoaded && this.map.animateToRegion({
            latitude: newCoordinate.latitude,
            longitude: newCoordinate.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }, 500);
        });
      },
      (err) => console.log(err),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, interval: 1000 }
    );
  }

  async componentDidMount() {
    this.unsubscribe = auth().onAuthStateChanged(async user => {
      if (user) {
        let doc = await firestore().collection("users").doc(user.uid).get();
        if (doc.exists) this.setState({ userData: doc.data() }, () => this.getCalories());
      }
    });
    await this.requestLocationPermission();
  }

  startRunning = async () => {
    if (!this.state.startedRunning) {
      this.setState({ startedRunning: true });
      this.interval = setInterval(() => {
        this.setState({ duration: this.state.duration + 1 });
      }, 1000);
    }
  }

  stopRunning = async () => {
    clearInterval(this.interval);
  }

  formatTime(seconds) {
    let date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  }

  getCalories() {
    const getMets = () => {
      // get total time and total distance, calculate MET based on that, find formula online
    }
    const { weight, height, born, gender } = this.state.userData;
    const today = new Date() / 1000;  // get seconds
    const then = new Date(null).setSeconds(born.seconds) / 1000;  // get seconds
    const age = Math.round((today - then) / 31556952);  // get difference in dates displayed in years (rounded down to neared whole number)
    let v;
    if (gender === "male") v = 66.5 + (13.75 * weight) + (5.003 * height) - (6.775 * age);
    else v = 655.1 + (9.563 * weight) + (1.85 * height) - (4.676 * age);
    const mets = getMets();
    const x = (v * mets)/24; //kcal per hour
  }

  componentWillUnmount() {
    this.unsubscribe();
    Geolocation.clearWatch(this.watchID);
  }

  render() {
    return (
      <ScrollView>
        {this.state.locationPermission && (
          <View style={{ width: screenWidth, height: screenWidth, flex: 1 }}>
            <MapView
              showsUserLocation
              followsUserLocation
              style={styles.map}
              ref={ref => this.map = ref}
              onLayout={() => this.setState({ mapLoaded: true }, () => this.mapPrepare())}
              initialRegion={{
                latitude: this.state.position.currentLat,
                longitude: this.state.position.currentLong,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
              }}>
                {this.state.startedRunning && (<Polyline coordinates={this.state.position.coordArray} strokeWidth={3} />)}
                {this.state.startedRunning && (<Marker coordinate={this.state.position.intitialCoords} />)}
              </MapView>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", width: screenWidth, elevation: 2 }}>
              <Button title="START" onPress={() => this.startRunning()} titleStyle={{ fontSize: 24 }} buttonStyle={{ backgroundColor: "rgba(0, 255, 0, 0.3)", paddingVertical: 8 }} containerStyle={{ flexGrow: 1 }} />
              <Button title="STOP" onPress={() => this.stopRunning()} titleStyle={{ fontSize: 24 }} buttonStyle={{ backgroundColor: "rgba(255, 0, 0, 0.3)", paddingVertical: 8 }} containerStyle={{ flexGrow: 1 }} />
            </View>
          </View>
        )}
        <View style={{ flexDirection: "column", flexGrow: 1, backgroundColor: colors.dark, height: screenHeight/3 }}>
          <View style={{ flex: 3, display: "flex", justifyContent: "center", alignItems: "center", borderBottomColor: colors.light, borderWidth: StyleSheet.hairlineWidth }}>
            <Text style={{ textAlign: "center", color: colors.light, fontSize: 38 }}>{this.formatTime(this.state.duration)}</Text>
            <Text style={{ textAlign: "center", color: "#999", fontSize: 24 }}>Duration</Text>
          </View>
          <View style={{ flex: 2, display: "flex", flexDirection: "row" }}>
            <View style={{ flex: 1, borderRightColor: colors.light, borderRightWidth: StyleSheet.hairlineWidth, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ textAlign: "center", color: colors.light, fontSize: 30 }}>250</Text>
              <Text style={{ textAlign: "center", color: "#999", fontSize: 20 }}>Calories</Text>
            </View>
            <View style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ textAlign: "center", color: colors.light, fontSize: 30 }}>1.05</Text>
              <Text style={{ textAlign: "center", color: "#999", fontSize: 20 }}>Kilojoules</Text>
            </View>
            <View style={{ flex: 1, borderLeftColor: colors.light, borderLeftWidth: StyleSheet.hairlineWidth, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ textAlign: "center", color: colors.light, fontSize: 30 }}>32.4g</Text>
              <Text style={{ textAlign: "center", color: "#999", fontSize: 20 }}>Fat</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    height: screenWidth,
    width: screenWidth
  }
});