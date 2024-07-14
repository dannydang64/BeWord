import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, query, where, getDocs, updateDoc, arrayUnion, doc} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig';


// USED TO FIND FRIENDS AND ADD THEM AS FRIENDS USING EMAIL WE CAN CHANGE
// THIS TO USERNAME ANOTHER TIME 

const UserSearchScreen = ({ currentUserUid }) => {
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
  
  const handleAddFriend = async () => {
    if (!searchResult) return;

    try {
      const currentUserDocRef = doc(db, 'users', currentUserUid);
      await updateDoc(currentUserDocRef, {
        friends: arrayUnion(searchResult.uid), // add them to friends array in db 
      });
      Alert.alert('Success', `${searchResult.email} has been added as a friend.`);
      setSearchResult(null);
      setSearchEmail('');
    } catch (error) {
      console.error('Error adding friend:', error);
      Alert.alert('Error', 'Unable to add friend. Please try again later.');
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
          <Button title="Add Friend" onPress={handleAddFriend} />
        </View>
      )}
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
