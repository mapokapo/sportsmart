import React, { Component } from "react"
import { Text, View, TouchableOpacity, Dimensions } from "react-native";
import { Menu } from "react-native-paper";
import { Icon } from "react-native-elements";
import * as colors from "../media/colors";

const screenWidth = Math.round(Dimensions.get("window").width);

export default class CustomPicker extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={{ display: "flex", marginHorizontal: 15 }}>
        <Menu
          style={{ marginTop: -116, width: screenWidth-30 }}
          theme={{
            colors: {
              primary: colors.dark, placeholder: colors.dark, text: colors.dark,
              background: colors.light, backdrop: colors.dark
            }
          }}
          visible={this.props.visible}
          onDismiss={this.props.onDismiss}
          anchor={
            <View style={{ borderColor: colors.dark, borderWidth: 1, borderRadius: 4, marginVertical: 5 }}>
              <TouchableOpacity onPress={this.props.menuOnPress} style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                <Text style={{ fontSize: 17, color: colors.dark, fontWeight: "normal", margin: 15, marginVertical: 17, marginRight: "auto" }}>{this.props.unit.split("")[0].toUpperCase() + this.props.unit.substr(1, this.props.unit.length)}</Text>
                <Icon name="arrow-drop-down" size={28} color={colors.dark} containerStyle={{ marginHorizontal: 15 }} />
              </TouchableOpacity>
            </View>
          }
        >
          {this.props.children}
        </Menu>
      </View>
    )
  }
}
