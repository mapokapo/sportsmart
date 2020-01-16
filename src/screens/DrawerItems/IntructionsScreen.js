import React, { Component } from "react";
import { Text, View, StyleSheet, ScrollView } from "react-native";
import AppHeader from "../../components/AppHeader";
import * as colors from "../../media/colors";
import { Image, Icon } from "react-native-elements";

export default class IntructionsScreen extends Component {
  render() {
    return (
      <ScrollView style={styles.mainWrapper}>
        <AppHeader navigation={this.props.navigation} screenProps={this.props.screenProps} />
        <View style={{ ...styles.mainWrapper, paddingHorizontal: 30, paddingBottom: 30 }}>
          <Text style={styles.heading}>{this.props.screenProps.currentLang.labels.howToStart}</Text>
          <View style={{ flexDirection: "row", opacity: 0.75, flexWrap: "wrap", justifyContent: "center", alignItems: "center", flexShrink: 1 }}>
            <Text numberOfLines={2} style={{ textAlign: "center", fontSize: 20, color: colors.dark, flexWrap: "wrap" }}>{this.props.screenProps.currentLang.labels.howToStartText1}</Text><Icon style={{ textAlign: "center" }} color={colors.dark} size={24} type="material-community" name="run" /><Text numberOfLines={2} style={{ textAlign: "center", fontSize: 20, color: colors.dark, flexWrap: "wrap" }}>{this.props.screenProps.currentLang.labels.howToStartText2}</Text>
          </View>
          <Text style={styles.heading}>{this.props.screenProps.currentLang.labels.statistics}</Text>
          <Text style={{ textAlign: "center", fontSize: 20, color: colors.dark, flexWrap: "wrap", opacity: 0.75 }}>{this.props.screenProps.currentLang.labels.findStatisticsText}</Text>
          <Text style={{ textAlign: "center", fontSize: 20, color: colors.dark, flexWrap: "wrap", opacity: 0.75, marginTop: 10 }}>{this.props.screenProps.currentLang.labels.findStatisticsText2}</Text>
          <Text style={styles.heading}>{this.props.screenProps.currentLang.labels.medals}</Text>
          <Text style={{ textAlign: "center", fontSize: 20, color: colors.dark, flexWrap: "wrap", opacity: 0.75, marginBottom: 10 }}>{this.props.screenProps.currentLang.labels.medalsUseText}</Text>
          {this.props.screenProps.currentLang.labels.medalsTexts.map((name, index) => (
            <Text key={index.toString()} style={{ marginLeft: 20, fontSize: 18, color: colors.dark, flexWrap: "wrap", opacity: 0.75 }}>• {name}</Text>
          ))}
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  heading: {
    textAlign: "center",
    fontSize: 24,
    color: colors.dark,
    textDecorationLine: "underline",
    marginTop: 30,
    marginBottom: 15
  },
  mainWrapper: {
    display: "flex",
    flex: 1,
    backgroundColor: colors.light
  },
  error: {
    color: colors.red,
    fontSize: 16,
    textAlign: "center",
    marginTop: "auto",
    lineHeight: 15
  }
});