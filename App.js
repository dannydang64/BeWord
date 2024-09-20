import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Game from './src/screens/game';
import Welcome from './src/screens/Welcome';
import UserSearchScreen from './src/screens/userSearchScreen';
import FriendRequestsScreen from './src/screens/FriendRequestScreen';
import GameResultsScreen from './src/screens/GameResultsScreen';


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
        <Stack.Screen name="UserSearchScreen" component={UserSearchScreen} />
        <Stack.Screen name="FriendRequestScreen" component={FriendRequestsScreen} />
        <Stack.Screen name="GameResultsScreen" component={GameResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
