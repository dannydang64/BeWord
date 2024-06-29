import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Game from './src/screens/game';
import Welcome from './src/screens/Welcome';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from './firebaseConfig';
import { enableScreens } from 'react-native-screens';


//enableScreens();


// Initialize Firebase
//initializeApp(firebaseConfig);

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        {/* <Stack.Screen name="SignIn" component={SignIn} /> */}
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Game" component={Game} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
