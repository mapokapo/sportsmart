/**
 * @format
 */

import "react-native-gesture-handler";
import * as React from 'react';
import { AppRegistry, YellowBox } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import App from './src/App';
import {name as appName} from './app.json';
YellowBox.ignoreWarnings(['Warning: componentWill'])

export default function Main() {
  return (
    <PaperProvider>
      <App />
    </PaperProvider>
  );
}

AppRegistry.registerComponent(appName, () => Main);