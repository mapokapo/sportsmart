import React, { Component } from 'react'
import { LayoutAnimation, Keyboard } from "react-native";
import { Appbar, Surface } from "react-native-paper";
import { SearchBar, Icon } from "react-native-elements";
import * as colors from "../media/colors";

export default class AppHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      setting: this.props.navigation.state.routeName === "TogetherProfile" ? "back1" : (this.props.navigation.state.routeName === "Together" ? "back2" : this.props.navigation.dangerouslyGetParent().state.routes[0].key)
    };
  }

  render() {
    return (
      <Surface style={{ elevation: 10 }}>
        <Appbar.Header style={{ backgroundColor: colors.dark }}>
          <Appbar.Action
            color={colors.light}
            icon={this.state.setting === "Tabs" || this.state.setting === true || this.state.setting === "back1" || this.state.setting === "back2" ? "arrow-back" : "menu"}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
              if (this.state.setting === "back2") {
                Keyboard.dismiss();
                this.props.navigation.navigate("Running");
                return;
              }
              Keyboard.dismiss();
              this.state.setting === "Tabs" || this.state.setting === true || this.state.setting === "back1" ? this.props.navigation.goBack() : this.props.navigation.toggleDrawer();
            }}
          />
          {this.props.search ? (
            <SearchBar
              onFocus={this.props.search.onFocus}
              onBlur={this.props.search.onBlur}
              placeholder={this.props.search.placeholder}
              onChangeText={this.props.search.onChangeText}
              value={this.props.search.value}
              platform="default"
              round
              ref={this.props.search.ref}
              placeholderTextColor={colors.light}
              searchIcon={<Icon containerStyle={{ display: this.props.search.focused ? "none" : undefined }} name="search" color={colors.light} size={24} />}
              clearIcon={<Icon name="clear" color={colors.light} size={20} onPress={this.props.search.clearIconOnPress} />}
              clearButtonMode="while-editing"
              containerStyle={{ flex: 1, margin: 0, padding: 0, backgroundColor: "transparent", borderBottomColor: 'transparent', borderTopColor: 'transparent' }}
              inputContainerStyle={{ backgroundColor: "rgba(255, 255, 255, 0.05)", margin: 0, padding: 0, borderColor: undefined }}
              inputStyle={{ color: colors.light, margin: 0, padding: 0, borderColor: undefined }}
              style={{ margin: 0, padding: 0, borderColor: undefined }}
            />
            ) : (<Appbar.Content
            color={colors.light}
            title={this.state.setting === "Tabs" || this.state.setting === true ? this.props.screenProps.currentLang.labels[this.props.navigation.state.key.toLowerCase()] : (this.state.setting === "back1" ? this.props.screenProps.currentLang.labels.profile : this.props.screenProps.currentLang.labels[this.props.navigation.state.routes[this.props.navigation.state.index].key.toLowerCase()])}
          />)}
        </Appbar.Header>
      </Surface>
    )
  }
}
