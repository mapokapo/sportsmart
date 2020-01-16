import React, { Component } from "react";
import { Dimensions, View, StyleSheet, ScrollView, PermissionsAndroid, Text, ToastAndroid, ActivityIndicator, Keyboard, AppState } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { Button } from "react-native-elements";
import * as colors from "../../media/colors";
import Geolocation from "react-native-geolocation-service";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import BackgroundGeolocation from "@mauron85/react-native-background-geolocation";
import AsyncStorage from '@react-native-community/async-storage';

const screenWidth = Math.round(Dimensions.get("window").width);
const screenHeight = Math.round(Dimensions.get("window").height);

export default class RunningScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      permLoading: false,
      isRunning: false,
      userData: null,
      locationPermission: false,
      mapLoaded: false,
      duration: 0,
      prevDuration: 0,
      position: {
        lat: 0,
        long: 0,
        markerArray: [],
        distance: 0,
        prevDistance: 0,
        prevCoords: {},
        startingCoords: {}
      },
      kcal: 0,
      kjoules: 0,
      prevKj: 0,
      prevkcal: 0
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
    return haversine(this.state.position.prevCoords, newLatLng, { unit: this.state.userData && this.state.userData.unit === "imperial" ? "mile" : "km" }) || 0;
  };

  requestLocationPermission = () => new Promise(async (resolve, reject) => {
    try {
      this.setState({ permLoading: true });
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: this.props.screenProps.currentLang.labels.locationPermissionTitle,
          message: this.props.screenProps.currentLang.labels.locationPermissionText,
          buttonPositive: "OK",
        },
      );
      this.setState({ permLoading: false, locationPermission: granted === PermissionsAndroid.RESULTS.GRANTED }, () => {
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });

  foregroundLocFetch = () => {
    this.foregroundWatch = Geolocation.watchPosition(position => {
      let newCoordinate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      this.setState({
        position: {
          lat: newCoordinate.latitude,
          long: newCoordinate.longitude,
          markerArray: [newCoordinate],
          distance: 0,
          prevDistance: this.state.position.distance,
          prevCoords: { latitude: this.state.position.lat, longitude: this.state.position.long },
          startingCoords: newCoordinate
        }
      }, () => {
        this.map.animateToRegion({
          latitude: this.state.position.lat,
          longitude: this.state.position.long,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }, 500);
        this.state.userData && this.state.isRunning && this.getCalories();
      });
    },
    error => ToastAndroid.show(this.props.screenProps.currentLang.errors.mapError + error.message, ToastAndroid.SHORT),
    { enableHighAccuracy: true, interval: 1000, fastestInterval: 1000, distanceFilter: 30 });
  }

  _handleAppStateChange = async nextAppState => {
    if (this.state.isRunning)
      if (nextAppState === "background") {
        AsyncStorage.setItem("sportsmart-runningBackgroundLastDate", new Date().getTime().toString());
      } else {
        const ms = await AsyncStorage.getItem("sportsmart-runningBackgroundLastDate");
        if (ms) {
          const difference = new Date() - new Date(JSON.parse(ms));
          this.setState({ duration: this.state.duration + (difference / 1000) - 2 });
        }
      }
  }

  componentDidMount() {
    AppState.addEventListener("change", this._handleAppStateChange);
    Keyboard.dismiss();
    this._mounted = true;
    this.unsubscribe = auth().onAuthStateChanged(async user => {
      if (user) {
        let doc = await firestore().collection("users").doc(user.uid).get();
        if (doc.exists) this.setState({ userData: doc.data() });
      }
    });
    BackgroundGeolocation.configure({
      desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
      debug: false,
      stationaryRadius: 10,
      distanceFilter: 30,
      notificationTitle: "Sportsmart location tracking",
      startOnBoot: false,
      startForeground: true,
      locationProvider: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
      interval: 1000,
      fastestInterval: 1000,
      activitiesInterval: 1000,
      notificationsEnabled: false
    });
    BackgroundGeolocation.on("location", location => {
      let newCoordinate = {
        latitude: location.latitude,
        longitude: location.longitude
      };
      this.setState({
        position: {
          ...this.state.position,
          prevCoords: { latitude: this.state.position.lat, longitude: this.state.position.long }
        }
      }, () => {
        this.setState({
          position: {
            lat: newCoordinate.latitude,
            long: newCoordinate.longitude,
            markerArray: this.state.position.markerArray.concat([newCoordinate]),
            distance: this.state.position.distance + this.calcDistance(newCoordinate),
            prevDistance: this.state.position.distance,
            prevCoords: { latitude: this.state.position.lat, longitude: this.state.position.long },
            startingCoords: this.state.position.startingCoords
          }
        }, () => {
          this.map.animateToRegion({
            latitude: this.state.position.lat,
            longitude: this.state.position.long,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }, 500);
          this.state.userData && this.state.isRunning && this.getCalories();
        });
      });
    });
    this.requestLocationPermission();
  }

  startRunning = async () => {
    if (!this.state.isRunning) {
      Geolocation.clearWatch(this.foregroundWatch);
      this.foregroundWatch = null;
      Geolocation.stopObserving();
      BackgroundGeolocation.start();
      this.setState({ isRunning: true });
      this.interval = setInterval(() => {
        this.setState({ duration: this.state.duration + 1 });
        this.map.animateToRegion({
          latitude: this.state.position.lat,
          longitude: this.state.position.long,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }, 500);
      }, 1000);
    }
  }

  stopRunning = async () => {
    if (this.state.isRunning) {
      clearInterval(this.interval);
      this.interval = null;
      BackgroundGeolocation.stop();
      this.foregroundLocFetch();
      this.setState({ prevDuration: 0, isRunning: false, duration: 0, kcal: 0, kjoules: 0, position: { lat: this.state.position.lat, long: this.state.position.long, markerArray: [{ longitude: this.state.position.long, latitude: this.state.position.lat }], distance: 0, prevCoords: {}, startingCoords: { longitude: this.state.position.long, latitude: this.state.position.lat } } });
    }
  }

  formatTime(seconds) {
    let date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  }

  getCalories = () => {
    if (Math.round(this.state.position.distance * 100) / 100 > 0) {
      let getMets = () => {
        let getMet = n => {
          let num = 1.9;
          for (let i = 0; i <= n; i++) {
            if (i % 4 === 0 && i !== 0) {
              num += 0.4;
            } else {
              num += 0.5;
            }
          }
          return num;
        }
        const totalTime = this.state.duration / 3600;  // hours
        const totalDistance = this.state.position.distance;  // km
        const speed = Math.round((totalDistance/totalTime)*2)/2; // km/h
        let index = (speed - 5) / 0.5 + 1;
        return getMet(index);
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
        if (unit === "metric") v = 66.5 + (13.75 * weight) + (5.003 * height) - (6.775 * age);
        else v = 65 + (6.2 * weight) + (12.7 * height) - (6.8 * age);
      }else {
        if (unit === "metric") v = 655.1 + (9.563 * weight) + (1.85 * height) - (4.676 * age);
        else v = 655 + (4.3 * weight) + (4.7 * height) - (4.7 * age);
      }
      const mets = getMets();
      let x = Math.round((v * (mets/24) * (this.state.duration / 3600)) * 2) / 2; // kcal, rounded
      this.setState({ kcal: x, kjoules: Math.round((x * 4.184) * 2) / 2, prevKj: this.state.kjoules, prevkcal: this.state.kcal }, async () => {
        const doc = await firestore().collection("users").doc(this.state.userData.uid).get();
        const mData = doc.data().data || [];  // modified data - array of objects that's about to change
        function dateDiffInHours(a, b) {
          return Math.abs(b - a) / 36e5;
        }
        // store only last 5 days worth of info about activity, and also update last day with activity info
        if (mData.length === 0) { // if there is no data for the user
          let newObj = {
            kjoules: this.state.kjoules,
            kcal: this.state.kcal,
            duration: this.state.duration,
            distance: Math.round(this.state.position.distance * 100 + Number.EPSILON) / 100,
            date: new Date().toString()
          };
          mData.push(newObj);
        } else if (dateDiffInHours(new Date(mData[mData.length - 1].date), new Date()) >= 24) { // if 1 day has passed since previous update object
          let newObj = {
            kjoules: this.state.kjoules,
            kcal: this.state.kcal,
            duration: this.state.duration,
            distance: Math.round(this.state.position.distance * 100 + Number.EPSILON) / 100,
            date: new Date().toString()
          };
          mData.push(newObj);
          if (mData.length > 5) {
            mData.shift();
          }
        } else { // update current activity object
          mData[mData.length - 1].kjoules += (this.state.kjoules - this.state.prevKj);
          mData[mData.length - 1].kcal += (this.state.kcal - this.state.prevkcal);
          mData[mData.length - 1].duration += Math.abs(this.state.duration - this.state.prevDuration);
          mData[mData.length - 1].distance += Math.round( (this.state.position.distance - this.state.position.prevDistance) * 100 + Number.EPSILON) / 100;
        }
        this.setState({ prevDuration: this.state.duration });
        firestore().collection("users").doc(this.state.userData.uid).update({
          data: mData
        });
      });
    }
  }

  componentWillUnmount = () => {
    this._mounted = false;
    this.unsubscribe();
    Geolocation.clearWatch(this.watchID);
    BackgroundGeolocation.removeAllListeners();
    BackgroundGeolocation.stop();
    AppState.removeEventListener("change", this._handleAppStateChange);
  }

  render() {
    return (
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>
        {this.state.mapLoaded && (<View style={{ position: "absolute", zIndex: 1, display: "flex", flexDirection: "row", justifyContent: "center", width: screenWidth }}>
          <View style={{ display: "flex", flexDirection: "row" }}>
            {!this.state.isRunning && (<Button title="START" onPress={() => this.startRunning()} titleStyle={{ fontSize: 24 }} buttonStyle={{ backgroundColor: "rgba(0, 255, 0, 0.3)", paddingVertical: 8 }} containerStyle={{ flexGrow: 1 }} />)}
            {this.state.isRunning && (<Button title="STOP" onPress={() => this.stopRunning()} titleStyle={{ fontSize: 24 }} buttonStyle={{ backgroundColor: "rgba(255, 0, 0, 0.3)", paddingVertical: 8 }} containerStyle={{ flexGrow: 1 }} />)}
          </View>
        </View>)}
        {this.state.locationPermission && !this.state.permLoading ?
          <View style={{ width: screenWidth, height: screenWidth, flex: 1, zIndex: 0 }}>
            <MapView
              showsUserLocation
              followsUserLocation
              style={styles.map}
              ref={ref => this.map = ref}
              onLayout={() => this.setState({ mapLoaded: true }, () => {
                Geolocation.getCurrentPosition(position => {
                  let newCoordinate = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                  };
                  this.setState({
                    position: {
                      lat: newCoordinate.latitude,
                      long: newCoordinate.longitude,
                      markerArray: [newCoordinate],
                      distance: 0,
                      prevCoords: { latitude: this.state.position.lat, longitude: this.state.position.long },
                      startingCoords: newCoordinate
                    }
                  }, () => {
                    this.map.animateToRegion({
                      latitude: this.state.position.lat,
                      longitude: this.state.position.long,
                      latitudeDelta: 0.0922,
                      longitudeDelta: 0.0421
                    }, 500);
                    this.state.userData && this.state.isRunning && this.getCalories();
                  }, () => this.foregroundLocFetch());
                })
              })}
              initialRegion={{
                latitude: this.state.position.lat,
                longitude: this.state.position.long,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421
              }}>
              {this.state.isRunning && (<Polyline coordinates={this.state.position.markerArray} strokeWidth={3} />)}
              {this.state.isRunning && (<Marker coordinate={this.state.position.startingCoords} />)}
            </MapView>
          </View>
        :
        (this.state.permLoading) ? <ActivityIndicator size="large" color={colors.dark} /> : <Text>{this.props.screenProps.currentLang.errors.mapPermError}</Text>}
        <View style={{ flexDirection: "column", flexGrow: 1, backgroundColor: colors.dark, height: screenHeight/3 }}>
          <View style={{ flex: 3, display: "flex", justifyContent: "center", alignItems: "center", borderBottomColor: colors.light, borderWidth: StyleSheet.hairlineWidth }}>
            <Text style={{ textAlign: "center", color: colors.light, fontSize: 38 }}>{this.formatTime(this.state.duration)}</Text>
            <Text style={{ textAlign: "center", color: "#999", fontSize: 24 }}>{this.props.screenProps.currentLang.labels.duration}</Text>
          </View>
          {this.state.userData !== null ?(<View style={{ flex: 2, display: "flex", flexDirection: "row" }}>
            <View style={{ flex: 1, borderRightColor: colors.light, borderRightWidth: StyleSheet.hairlineWidth, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ textAlign: "center", color: colors.light, fontSize: 30 }}>{this.state.userData && this.state.userData.unit === "metric" ? this.state.kcal : this.state.kcal / 1000}</Text>
              <Text style={{ textAlign: "center", color: "#999", fontSize: 20 }}>{this.state.userData && this.state.userData.unit === "metric" ? "Kcal" : "Calories"}</Text>
            </View>
            <View style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ textAlign: "center", color: colors.light, fontSize: 30 }}>{this.state.kjoules}</Text>
              <Text style={{ textAlign: "center", color: "#999", fontSize: 20 }}>{this.props.screenProps.currentLang.labels.kjoules}</Text>
            </View>
            <View style={{ flex: 1, borderLeftColor: colors.light, borderLeftWidth: StyleSheet.hairlineWidth, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ textAlign: "center", color: colors.light, fontSize: 30 }}>{Math.round(this.state.position.distance * 100) / 100}{this.state.userData && this.state.userData.unit === "imperial" ? "mi" : "km"}</Text>
              <Text style={{ textAlign: "center", color: "#999", fontSize: 20 }}>{this.props.screenProps.currentLang.labels.distance}</Text>
            </View>
          </View>) : (<View style={{ flex: 2, display: "flex", flexDirection: "row" }}>
            <View style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", marginRight: "auto", marginLeft: "auto" }}>
              <Text style={{ textAlign: "center", color: colors.light, fontSize: 30 }}>{Math.round(this.state.position.distance * 100) / 100}km</Text>
              <Text style={{ textAlign: "center", color: "#999", fontSize: 20 }}>{this.props.screenProps.currentLang.labels.distance}</Text>
            </View>
          </View>)}
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