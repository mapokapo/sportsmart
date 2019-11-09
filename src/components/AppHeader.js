import React, { Component } from 'react'
import { Appbar, Surface } from "react-native-paper";

export default class AppHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Surface style={{ elevation: 10 }}>
        <Appbar.Header style={{ backgroundColor: "#022e4b" }}>
          <Appbar.Action
            color="#ffffff"
            icon="menu"
            onPress={() => {
              this.props.navigation.toggleDrawer();
            }}
          />
          <Appbar.Content
            color="#ffffff"
            title={this.props.navigation.state.routes[this.props.navigation.state.index].key}
          />
        </Appbar.Header>
      </Surface>
    )
  }
}
