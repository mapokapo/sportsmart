import React, { Component } from "react";
import { Text, View, LayoutAnimation, UIManager, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import AppHeader from "../../components/AppHeader";
import * as colors from "../../media/colors";
import algoliasearch from "algoliasearch/lite";
import { ListItem, Icon } from "react-native-elements";

export default class TogetherScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
      focused: false,
      items: [],
      loading: null,
      currentSearchTimeout: null,
      index: null
    };

    this.search = React.createRef();

    if (Platform.OS === "android") {
      UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  componentDidMount = () => {
    const searchClient = algoliasearch("AK9NCBZZP9", "2761958e4e4310ffa9a991ab6ef93b6d");
    const index = searchClient.initIndex("users");
    this.setState({ index });
    index.search({ query: this.state.value });
  }

  searchUsers = searchText => {
    if (this.state.currentSearchTimeout === null && searchText !== "") {
      this.state.currentSearchTimeout = setTimeout(() => {
        if (this.state.index !== null) {
          this.state.index.search({
            query: this.state.value,
            hitsPerPage: 5,
            page: 0,
            analytics: false,
            attributesToRetrieve: ["name", "email", "profileImage", "born", "joined", "gender", "bio", "weight", "height", "uid"],
            responseFields: ["hits"],
            enableABTest: false
          }).then(({ hits }) => {
            this.setState({ loading: false, currentSearchTimeout: null, items: hits });
          });
        }
      }, 1000);
    }
  }

  renderItem = item => {
    return (
      <ListItem
        containerStyle={{ backgroundColor: colors.light }}
        title={<Text style={{ color: colors.dark, fontSize: 24 }}>{item.item.name}</Text>}
        subtitle={<Text style={{ color: colors.dark, fontSize: 16, opacity: 0.8 }}>{item.item.email}</Text>}
        rightIcon={<Icon name="keyboard-arrow-right" size={24} color={colors.dark} />}
        leftAvatar={{ source: { uri: item.item.profileImage } }}
        bottomDivider
        onPress={() => {
          this.props.navigation.navigate("TogetherProfile", {
            userItem: item
          });
        }}
      />
    )
  }

  render() {
    return (
      <View style={styles.mainWrapper}>
        <AppHeader setting={true} navigation={this.props.navigation} screenProps={this.props.screenProps} search={{
          value: this.state.value,
          placeholder: this.props.screenProps.currentLang.labels.searchUsers,
          onChangeText: text => {
            this.setState({ value: text, loading: true }, () => {
              if (text !== "") {
                this.searchUsers(this.state.value);
              } else {
                this.setState({ loading: false });
              }
            });
          },
          clearIconOnPress: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            this.setState({ value: "", focused: false });
          },
          ref: this.search,
          focused: this.state.focused,
          onFocus: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            this.setState({ focused: true, value: this.state.value });
          },
          onBlur: () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            this.setState({ focused: false, value: this.state.value });
          }
        }} />
        <View style={{ flex: 1 }}>
          {this.state.loading !== null && (<View style={{ flex: 1 }}>
            {this.state.loading ? (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><Text style={{ fontSize: 24, color: colors.dark }}>{this.props.screenProps.currentLang.labels.loading}...</Text>
              <ActivityIndicator size="large" color={colors.dark} /></View>
            ) : (
              <FlatList
                data={this.state.items}
                renderItem={item => this.renderItem(item)}
                keyExtractor={(item, index) => index.toString()}
              />
            )}
          </View>)}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  mainWrapper: {
    display: "flex",
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.light
  }
});