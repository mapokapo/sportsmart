import React, { Component } from 'react'
import { LayoutAnimation } from "react-native";
import { Appbar, Surface } from "react-native-paper";
import * as colors from "../media/colors";

export default class AppHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      setting: this.props.navigation.dangerouslyGetParent().state.routes[0].key
    };
  }

  render() {
    return (
      <Surface style={{ elevation: 10 }}>
        <Appbar.Header style={{ backgroundColor: colors.dark }}>
          <Appbar.Action
            color={colors.light}
            icon={this.state.setting === "Tabs" || this.state.setting === true ? "arrow-back" : "menu"}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
              this.state.setting === "Tabs" || this.state.setting === true ? this.props.navigation.goBack() : this.props.navigation.toggleDrawer();
            }}
          />
          <Appbar.Content
            color={colors.light}
            title={this.state.setting === "Tabs" || this.state.setting === true ? this.props.screenProps.currentLang.labels[this.props.navigation.state.key.toLowerCase()] : this.props.screenProps.currentLang.labels[this.props.navigation.state.routes[this.props.navigation.state.index].key.toLowerCase()]}
          />
        </Appbar.Header>
      </Surface>
    )
  }
}
