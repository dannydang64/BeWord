import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import SignIn from './SignInScreen';
import {app} from '../../firebaseConfig'
import { getAuth, GoogleAuthProvider,  signInWithRedirect} from "firebase/auth";

const auth = getAuth(app); 
const provider = new GoogleAuthProvider(); 

const Welcome = ({ navigation }) => {
  const handleSignIn = () => {
    // Implement your sign-out logic here
    //signInWithRedirect(auth, provider);
    navigation.navigate('SignIn');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BeWord</Text>
      <Text style={styles.para}>
        Here at BeWord we want to be able to competing in NYT's wordle to 
        a whole new level. Everyday we will send out a notification that will
        let users know the word of day is about to be released. Users will start
        at the same time and race to finish the Wordle in least amount of tries
        and least amount of time.  
      </Text>
      <Button title="Sign In" onPress={handleSignIn} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  para: {
    fontSize: 12,
    paddingLeft: 5, 
    paddingRight:5,
  },
});

export default Welcome;
