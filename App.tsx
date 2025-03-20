import React from 'react';
import {AppRegistry} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {StackNavigator} from './src/navigator/StackNavigator';
import Toast from 'react-native-toast-message';

function App(): React.JSX.Element {
    AppRegistry.registerComponent('App', () => App);

    return (
        <>
            <NavigationContainer>
                <StackNavigator/>
            </NavigationContainer>
            <Toast/>
        </>
    );
}


export default App;
