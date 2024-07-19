import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, arrayUnion, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig';
import { useRoute, useNavigation } from '@react-navigation/native'; // Import hooks for route and navigation
import FriendRequestScreen from './FriendRequestScreen';


// USED TO FIND FRIENDS AND ADD THEM AS FRIENDS USING EMAIL WE CAN CHANGE
// THIS TO USERNAME ANOTHER TIME 

const UserSearchScreen = () => {
  //added this after ran into error of not 
  const route = useRoute();
  const navigation = useNavigation(); // Use useNavigation hook

  const { currentUserUid } = route.params; // Retrieve the currentUserUid from route params

  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const db = getFirestore(app);
  const auth = getAuth(app);



  const handleSearch = async () => {
    try {
      // Verify the user is authenticated
      if (!auth.currentUser) {
        Alert.alert('Error', 'You must be logged in to search for users.');
        return;
      }

      const q = query(collection(db, 'users'), where('email', '==', searchEmail));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('User not found', 'No user found with the specified email address.');
        setSearchResult(null);
      } else {
        const user = querySnapshot.docs[0].data();
        setSearchResult({ uid: querySnapshot.docs[0].id, ...user });
      }
    } catch (error) {
      console.error('Error searching user:', error);
      Alert.alert('Error', 'An error occurred while searching for the user.');
    }
  };

  const handleSendFriendRequest = async () => {
    if (!searchResult) return; //if theres no user by that email 

    console.log('Current User UID in UserSearchScreen:', currentUserUid);

    try { // look up try catch 
      const friendRequest = { // name of the collection in the db 
        from: currentUserUid,
        to: searchResult.uid,
        status: 'Pending',
        time: new Date(),

      };
      await addDoc(collection(db, 'friendRequests'), friendRequest);
      Alert.alert('Success', `Friend request sent to ${searchResult.email}.`);
      setSearchResult(null); // clean up after u send the request
      setSearchEmail('');
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Unable to send friend request. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter user's email"
        value={searchEmail}
        onChangeText={setSearchEmail}
      />
      <Button title="Search" onPress={handleSearch} />
      {searchResult && (
        <View style={styles.resultContainer}>
          <Text>User found: {searchResult.email}</Text>
          <Button title="Send Friend Request" onPress={handleSendFriendRequest} />
        </View>
      )}
      <Button title="View Friend Requests" onPress={() => navigation.navigate('FriendRequestScreen', {currentUserUid})} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    color: 'black',
  },
  resultContainer: {
    marginTop: 10,
  },

});

export default UserSearchScreen;
