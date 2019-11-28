import React, { Component } from "react";
import { Dimensions, View, StyleSheet, ScrollView, PermissionsAndroid, Text } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Button } from "react-native-elements";
import * as colors from "../../media/colors";
import Geolocation from "react-native-geolocation-service";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

const screenWidth = Math.round(Dimensions.get("window").width);
const screenHeight = Math.round(Dimensions.get("window").height);

export default class RunningScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRunning: false,
      displayLines: false,
      mapLoaded: false,
      userData: null,
      locationPermission: false,
      duration: 0,
      distanceTravelled: 0,
      position: {
        currentLat: 0,
        currentLong: 0,
        coordArray: [],
        distance: 0,
        prevCoords: {},
        intitialCoords: null
      },
      kcal: 0,
      kjoules: 0,
      fat: 0
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
          title: this.props.screenProps.currentLang.labels.locationPermissionTitle,
          message: this.props.screenProps.currentLang.labels.locationPermissionText,
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
            coordArray: this.state.isRunning ? this.state.position.coordArray.concat([newCoordinate]) : [newCoordinate],
            prevCoords: newCoordinate,
            distance: this.state.position.distance + this.state.isRunning ? this.calcDistance(newCoordinate) : 0,
            intitialCoords: this.state.isRunning ? this.state.position.intitialCoords : newCoordinate
          }
        }, () => {
          this.setState({ distanceTravelled: this.state.distanceTravelled + this.state.position.distance }, () => {
            if (this.state.mapLoaded) {
              this.map.animateToRegion({
                latitude: newCoordinate.latitude,
                longitude: newCoordinate.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
              }, 500);
              this.getCalories();
            }
          });
        });
      },
      (err) => console.log(err),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, interval: 1000 }
    );
  }

  componentDidMount() {
    this.unsubscribe = auth().onAuthStateChanged(async user => {
      if (user) {
        let doc = await firestore().collection("users").doc(user.uid).get();
        if (doc.exists) this.setState({ userData: doc.data() }, () => this.getCalories());
      }
    });
    this.requestLocationPermission();
  }

  startRunning = async () => {
    if (!this.state.isRunning) {
      this.setState({ isRunning: true, displayLines: true });
      this.interval = setInterval(() => {
        this.setState({ duration: this.state.duration + 1 });
      }, 1000);
    }
  }

  stopRunning = async () => {
    if (this.state.isRunning && this.state.displayLines) {
      clearInterval(this.interval);
      this.interval = null;
      this.setState({ isRunning: false });
    } else if (!this.state.isRunning && this.state.displayLines) {
      this.setState({ displayLines: false, distanceTravelled: 0, duration: 0, kcal: 0, kjoules: 0, fat: 0, position: { ...this.state.position, coordArray: [this.state.position.coordArray[this.state.position.coordArray.length-1]], distance: 0, initialCoords: null } });
    }
  }

  formatTime(seconds) {
    let date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  }

  getCalories() {
    console.log(this.state.duration, this.state.distanceTravelled, this.state.isRunning)
    if (this.state.duration !== 0 && this.state.distanceTravelled !== 0 && this.state.isRunning) {
      const getMets = () => {
        const totalTime = this.state.duration / 3600;
        const totalDistance = this.state.distanceTravelled;
        const speed = Math.round((totalDistance/totalTime)*2)/2;
        let metValues = [5.3, 5.8, 6.2, 6.7, 7.2, 7.7, 8.1, 8.6, 9.1, 9.6, 10.0, 10.5, 11.0, 11.5, 12.0, 12.4, 12.9, 13.4, 13.9, 14.3, 14.8, 15.3, 15.8, 16.2, 16.7, 17.2, 17.7, 18.1, 18.6, 19.1, 19.6, 20.0, 20.5, 21.0, 21.5, 22.0, 22.4, 22.9, 23.4, 23.9];
        let finalMetValue;
        if (speed < 5) {
          finalMetValue = metValues[0];
        } else {
          finalMetValue = metValues[(speed - 5) / 0.5 + 1];
        }
        return finalMetValue;
      }
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
      const { weight, height, born, gender, unit } = this.state.userData;
      const age = getAge(born);
      let v;
      if (gender === "male") {
        if (unit === "metric") v = 66.5 + (13.75 * weight) + (5.003 * height * 100) - (6.775 * age);
        else v = 65 + (6.2 * weight) + (12.7 * height) - (6.8 * age);
      }else {
        if (unit === "metric") v = 655.1 + (9.563 * weight) + (1.85 * height * 100) - (4.676 * age);
        else v = 655 + (4.3 * weight) + (4.7 * height) - (4.7 * age);
      }
      const mets = getMets();
      let x = (v * mets)/24; // kcal per hour
      x = x * this.state.duration; // kcal
      this.setState({ kcal: x, kjoules: x * 4.184, fat: x / 7650 });
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
    Geolocation.clearWatch(this.watchID);
  }

  render() {
    return (
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        <View style={{ position: "absolute", zIndex: 1, display: "flex", flexDirection: "row", justifyContent: "center", width: screenWidth }}>
          <View style={{ display: "flex", flexDirection: "row" }}>
            <Button title="START" onPress={() => this.startRunning()} titleStyle={{ fontSize: 24 }} buttonStyle={{ backgroundColor: "rgba(0, 255, 0, 0.3)", paddingVertical: 8 }} containerStyle={{ flexGrow: 1 }} />
            {this.state.displayLines && (<Button title={this.state.isRunning ? this.props.screenProps.labels.pause : "STOP"} onPress={() => this.stopRunning()} titleStyle={{ fontSize: 24 }} buttonStyle={{ backgroundColor: "rgba(255, 0, 0, 0.3)", paddingVertical: 8 }} containerStyle={{ flexGrow: 1 }} />)}
          </View>
        </View>
        {this.state.locationPermission && (
          <View style={{ width: screenWidth, height: screenWidth, flex: 1, zIndex: 0 }}>
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
              {this.state.displayLines && (<Polyline coordinates={this.state.position.coordArray} strokeWidth={3} />)}
              {this.state.displayLines && (<Marker coordinate={this.state.position.intitialCoords} />)}
            </MapView>
          </View>
        )}
        <View style={{ flexDirection: "column", flexGrow: 1, backgroundColor: colors.dark, height: screenHeight/3 }}>
          <View style={{ flex: 3, display: "flex", justifyContent: "center", alignItems: "center", borderBottomColor: colors.light, borderWidth: StyleSheet.hairlineWidth }}>
            <Text style={{ textAlign: "center", color: colors.light, fontSize: 38 }}>{this.formatTime(this.state.duration)}</Text>
            <Text style={{ textAlign: "center", color: "#999", fontSize: 24 }}>{this.props.screenProps.currentLang.labels.duration}</Text>
          </View>
          <View style={{ flex: 2, display: "flex", flexDirection: "row" }}>
            <View style={{ flex: 1, borderRightColor: colors.light, borderRightWidth: StyleSheet.hairlineWidth, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ textAlign: "center", color: colors.light, fontSize: 30 }}>{this.state.userData && this.state.userData.unit === "metric" ? this.state.kcal : this.state.kcal / 1000}</Text>
              <Text style={{ textAlign: "center", color: "#999", fontSize: 20 }}>{this.state.userData && this.state.userData.unit === "metric" ? "Kcal" : "Calories"}</Text>
            </View>
            <View style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ textAlign: "center", color: colors.light, fontSize: 30 }}>{this.state.kjoules}</Text>
              <Text style={{ textAlign: "center", color: "#999", fontSize: 20 }}>{this.props.screenProps.currentLang.labels.kjoules}</Text>
            </View>
            <View style={{ flex: 1, borderLeftColor: colors.light, borderLeftWidth: StyleSheet.hairlineWidth, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ textAlign: "center", color: colors.light, fontSize: 30 }}>{this.state.fat}</Text>
              <Text style={{ textAlign: "center", color: "#999", fontSize: 20 }}>{this.props.screenProps.currentLang.labels.fat}</Text>
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