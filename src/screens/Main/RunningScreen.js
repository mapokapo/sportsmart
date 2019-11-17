import React, { Component } from "react";
import { Dimensions, View, StyleSheet, ScrollView, PermissionsAndroid, Text } from "react-native";
import MapView, { AnimatedRegion, MarkerAnimated, Polyline } from "react-native-maps";
import { Button } from "react-native-elements";
import * as colors from "../../media/colors";
import Geolocation from "react-native-geolocation-service";

const screenWidth = Math.round(Dimensions.get("window").width);
const screenHeight = Math.round(Dimensions.get("window").height);

export default class RunningScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locationPermission: false,
      position: {
        latitude: 0,
        longitude: 0,
        routeCoordinates: [],
        distanceTravelled: 0,
        prevLatLng: {},
        coordinate: new AnimatedRegion({
          latitude: 0,
          longitude: 0,
          latitudeDelta: 0,
          longitudeDelta: 0,
        })
      }
    };
  }

  calcDistance = newLatLng => {
    var haversine = (function () {
      var RADII = {
        km:    6371,
        mile:  3960,
        meter: 6371000,
        nmi:   3440
      }
    
      // convert to radians
      var toRad = function (num) {
        return num * Math.PI / 180
      }
    
      return function haversine (startCoordinates, endCoordinates) {
    
        var R = RADII.km
    
        var start = startCoordinates
        var end = endCoordinates
    
        var dLat = toRad(end.latitude - start.latitude)
        var dLon = toRad(end.longitude - start.longitude)
        var lat1 = toRad(start.latitude)
        var lat2 = toRad(end.latitude)
    
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2)
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    
        return R * c
      }
    
    })()
    return haversine(this.state.position.prevLatLng, newLatLng) || 0;
  };

  requestLocationPermission = () => new Promise(async (resolve, reject) => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Sportsmart requires your location permission",
          message:
            "Sportsmart needs access to your location " +
            "in order to track your walking distance.",
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

  componentDidMount() {
    this.requestLocationPermission().then(() => {
      this.watchID = Geolocation.watchPosition(
        position => {
          const newCoordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          this.marker._component.animateMarkerToCoordinate(
            newCoordinate,
            500
          );
          this.setState({
            position: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              routeCoordinates: this.state.position.routeCoordinates.concat([newCoordinate]),
              distanceTravelled:
              this.state.position.distanceTravelled + this.calcDistance(newCoordinate),
              prevLatLng: newCoordinate,
              coordinate: this.state.position.coordinate
            }
          });
         },
         () => {},
         { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    });
    
  }

  componentWillUnmount() {
    Geolocation.clearWatch(this.watchID);
  }

  render() {
    return (
      <ScrollView>
        {this.state.locationPermission && (
          <View style={{ width: screenWidth, height: screenWidth }}>
            <MapView
            showsUserLocation
            followsUserLocation
            style={styles.map}
            region={{
              latitude: this.state.position.latitude,
              longitude: this.state.position.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
            }}>
              <Polyline coordinates={this.state.position.routeCoordinates} strokeWidth={5} />
              <MarkerAnimated
                ref={marker => {
                  this.marker = marker;
                }}
                coordinate={this.state.position.coordinate}
              />
            </MapView>
            <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", width: screenWidth, elevation: 2 }}>
              <Button title="START" titleStyle={{ fontSize: 24 }} buttonStyle={{ backgroundColor: "rgba(0, 255, 0, 0.3)", paddingVertical: 8 }} containerStyle={{ flexGrow: 1 }} />
              <Button title="STOP" titleStyle={{ fontSize: 24 }} buttonStyle={{ backgroundColor: "rgba(255, 0, 0, 0.3)", paddingVertical: 8 }} containerStyle={{ flexGrow: 1 }} />
            </View>
          </View>
        )}
        <View style={{ flexGrow: 1, backgroundColor: colors.dark, height: screenHeight - 500 }}>
          <Text style={{ color: colors.light }}>Content goes here</Text>
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    height: screenWidth
  }
});