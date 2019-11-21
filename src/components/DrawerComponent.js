import React, { Component } from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { Drawer, Divider } from "react-native-paper";
import { Icon, Image } from "react-native-elements";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import * as colors from "../media/colors";
import { GraphRequest, GraphRequestManager, AccessToken } from "react-native-fbsdk";

export default class DrawerComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      drawerItems: [
        "Together",
        "Activity",
        "Statistics",
        "Settings",
        "Support"
      ],
      user: {
        name: "",
        email: "",
        profileImage: null
      }
    };
  }

  componentDidMount() {
    this.unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        firestore().collection("users").doc(user.uid).get().then(async doc => {
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
                this.setState({ user: { name, email, profileImage: res.picture.data.url } });
              }
            );

            new GraphRequestManager().addRequest(infoRequest).start();
          } else if (user.providerData[0].providerId === "google.com") {
            this.setState({ user: { name: user.displayName, email: user.email, profileImage: user.photoURL } });
          } else if (!doc.exists) {
            return;
          } else {
            const { name, email, profileImage } = doc.data();
            this.setState({ user: { name, email, profileImage } });
          }
        });
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    return (
      <Drawer.Section style={{ flex: 1, backgroundColor: colors.light }}>
        <TouchableOpacity style={{ padding: 25, display: "flex", justifyContent: "center" }}>
          {this.state.user.profileImage === null ? (
            <Icon type="material-community" name="account" color={colors.light} size={48} containerStyle={{ borderRadius: 56/2, width: 56, height: 56 }} />
          ) : (
            <Image
              source={{ uri: this.state.user.profileImage }}
              style={{ width: 56, height: 56 }}
              containerStyle={{ overflow: "hidden", borderRadius: 56/2, elevation: 1, width: 56, height: 56 }}
            />
          )}
          <Text style={{ color: "#022e4b", fontSize: 20, fontWeight: "500" }} >{this.state.user.name}</Text>
          <Text style={{ color: "#375777", fontSize: 12, fontWeight: "300" }} >{this.state.user.email}</Text>
        </TouchableOpacity>
        <Divider style={{ marginHorizontal: 10, marginBottom: 15, backgroundColor: colors.dark }} />
        {this.state.drawerItems.map((item, index) => {
          return (
            <Drawer.Item
              key={index}
              label={item}
              onPress={() => {
                this.props.navigation.navigate(item);
              }}
              style={styles.drawerItem}
              theme={{ colors: { primary: colors.dark } }}
            />
          )
        })}
      </Drawer.Section>
    );
  }
}

const styles = StyleSheet.create({
  drawerItem: {
    fontSize: 24
  }
});