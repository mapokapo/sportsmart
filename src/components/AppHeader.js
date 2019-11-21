import React, { Component } from 'react'
import { LayoutAnimation } from "react-native";
import { Appbar, Surface } from "react-native-paper";
import * as colors from "../media/colors";
import languages from "../media/languages";

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
            icon={this.state.setting === "Tabs" ? "arrow-back" : "menu"}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
              this.state.setting === "Tabs" ? this.props.navigation.goBack() : this.props.navigation.toggleDrawer();
            }}
          />
          <Appbar.Content
            color={colors.light}
            title={this.state.setting === "Tabs" ? languages.currentLang.labels[this.props.navigation.state.key.toLowerCase()] : languages.currentLang.labels[this.props.navigation.state.routes[this.props.navigation.state.index].key.toLowerCase()]}
          />
        </Appbar.Header>
      </Surface>
    )
  }
}
