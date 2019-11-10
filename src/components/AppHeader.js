import React, { Component } from 'react'
import { Appbar, Surface } from "react-native-paper";
import * as colors from "../media/colors";

export default class AppHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Surface style={{ elevation: 10 }}>
        <Appbar.Header style={{ backgroundColor: colors.dark }}>
          <Appbar.Action
            color={colors.light}
            icon="menu"
            onPress={() => {
              this.props.navigation.toggleDrawer();
            }}
          />
          <Appbar.Content
            color={colors.light}
            title={this.props.navigation.state.routeName}
          />
        </Appbar.Header>
      </Surface>
    )
  }
}
