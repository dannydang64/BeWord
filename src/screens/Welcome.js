import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, Pressable } from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import {app} from '../../firebaseConfig.js'

const Welcome = ({navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const auth = getAuth(app);

  const handleAuth = async () => {
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User signed up:', userCredential.user);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('HELLLLLLLLLLLLLLLLLLOOOOOOOOOOOOOO', userCredential.user);
        navigation.navigate('Game', { user: userCredential.user });
      }
      
    } catch (error) {
      console.error('Error during authentication:', error.code, error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to BeWord</Text>
      <Text style={styles.para}>
        Here at BeWord we want to take competing in NYT's Wordle to
        a whole new level. Every day we will send out a notification that will
        let users know the word of the day is about to be released. Users will start
        at the same time and race to finish the Wordle in the least amount of tries
        and the least amount of time.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <Pressable onPress={handleAuth} style={styles.button}>
        <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
      </Pressable>
      <Pressable onPress={() => setIsSignUp(!isSignUp)} style={styles.switchButton}>
        <Text style={styles.switchButtonText}>
          {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'top',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  para: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  switchButton: {
    marginTop: 12,
  },
  switchButtonText: {
    color: '#4285F4',
    fontSize: 14,
  },
});

export default Welcome;
