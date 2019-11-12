import React, { Component } from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { Drawer, Divider } from "react-native-paper";
import { Icon } from "react-native-elements";
import * as colors from "../media/colors";

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
      ]
    };
  }

  render() {
    return (
      <Drawer.Section style={{ flex: 1, backgroundColor: colors.light }}>
        <TouchableOpacity style={{ padding: 25, display: "flex", justifyContent: "center" }}>
          <Icon type="material-community" name="account" color={colors.light} size={48} containerStyle={{ borderRadius: 27, width: 56, height: 56, backgroundColor: colors.blue }} />
          <Text style={{ color: "#022e4b", fontSize: 20, fontWeight: "500" }} >Name</Text>
          <Text style={{ color: "#375777", fontSize: 12, fontWeight: "300" }} >EmailEmailEmailEmailEmail</Text>
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