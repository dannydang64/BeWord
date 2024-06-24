import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
//import { StackScreenProps } from '@react-navigation/stack';
//import { Button } from 'react-native-elements';

const SignIn = ({ navigation }) => {
  const handleSignIn = () => {
    // Implement your sign-in logic here
    navigation.navigate('Game');
  };

  return (
    <View style={styles.container}>
     <Text>Welcome screen!</Text>
      <Text style={styles.title}>Sign In</Text>
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
});

export default SignIn;
