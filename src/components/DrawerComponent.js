import React, { Component } from "react"
import { Text, View } from "react-native"
import { Drawer, Avatar, IconButton } from "react-native-paper";

export default class DrawerComponent extends Component {
  render() {
    return (
      <Drawer.Section style={{ flex: 1, marginBottom: 60, backgroundColor: "#fff", borderRadius: 20 }}>
        <View style={{ padding: 15, display: "flex", justifyContent: "center" }}>
          <IconButton
            icon="settings"
            color="#022e4b"
            size={24}
            onPress={() => console.log("Pressed")}
            style={{ alignSelf: "flex-end", margin: -1 }}
          />
          <Avatar.Image size={45} style={{ marginTop: 5, elevation: 1 }} source={{ uri: "https://picsum.photos/700" }} />
          <Text style={{ color: "#022e4b", fontSize: 20, fontWeight: "500" }} >Name</Text>
          <Text style={{ color: "#375777", fontSize: 12, fontWeight: "300" }} >EmailEmailEmailEmailEmail</Text>
        </View>
        <Text>[[DRAWER ITEMS]]</Text>
      </Drawer.Section>
    );
  }
}
