import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { getFirestore, collection, query, where, getDocs, addDoc, orderBy, limit, updateDoc } from 'firebase/firestore';
import { app } from '../../firebaseConfig';
import { colorsToEmoji } from '../constants'; // Import the colorsToEmoji object

const GameResultsScreen = ({ route }) => {
  const { currentUserUid, gameData } = route.params; // Receive gameData from Game.js when navigating
  const [gameResults, setGameResults] = useState([]);
  const db = getFirestore(app);

  // Save game result to Firestore
  const saveGameResult = async (newGameResult) => {
    try {
      // Flatten the arrays to avoid nested array errors
      const flattenedGuesses = newGameResult.guesses.join('|');  // Using '|' as a separator
      const flattenedColors = newGameResult.colors.map(row => row.join('|')).join(';');  // Flatten with ';' to separate rows
  
      const gameResultToSave = {
        uid: newGameResult.uid,
        date: newGameResult.date,
        guesses: flattenedGuesses,  // Save flattened guesses
        colors: flattenedColors,    // Save flattened colors
      };
  
      // Check if the user already has a game result document (most recent one)
      const q = query(
        collection(db, 'gameResults'),
        where('uid', '==', newGameResult.uid),
        orderBy('date', 'desc'),
        limit(1)
      );
  
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // If there is a recent result, update it
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, gameResultToSave);
        console.log('Game result updated:', gameResultToSave);
        Alert.alert('Success', 'Game result updated successfully!');
      } else {
        // If no result exists, add a new document
        const gameResultsCollectionRef = collection(db, 'gameResults');
        await addDoc(gameResultsCollectionRef, gameResultToSave);
        
        console.log('Game result saved:', gameResultToSave);
        Alert.alert('Success', 'Game result saved successfully! ');
      }
      fetchGameResults();  // Fetch to display the updated result immediately
    } catch (error) {
      console.error('Error saving game result: ', error);
      Alert.alert('Error', 'Failed to save game result.');
    }
  };
  
  // Function to convert color arrays into emoji strings
  const getEmojiString = (colors) => {
    return colors.map(row => row.map(color => colorsToEmoji[color]).join('')).join('\n');
  };

  // Fetch game results from Firestore
  const fetchGameResults = async () => {
    try {
      console.log('Fetching game results for user:', currentUserUid);
      const q = query(
        collection(db, 'gameResults'),
        where('uid', '==', currentUserUid), // Use the correct field name, such as 'uid'
        orderBy('date', 'desc'), // Order by date, descending
        limit(1) // Limit to 1 result (most recent)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setGameResults([]);  // Clear the state if no results are found
        console.log('No game results found.');
      } else {
        const results = querySnapshot.docs.map(doc => {
          const data = doc.data();

          // Reconstruct guesses and colors arrays
          const reconstructedGuesses = data.guesses.split('|');  // Split back to an array
          const reconstructedColors = data.colors.split(';').map(row => row.split('|'));  // Split rows first, then split each row

          return {
            id: doc.id,
            ...data,
            guesses: reconstructedGuesses,
            colors: reconstructedColors,
          };
        });

        console.log('Fetched game results:', results);
        setGameResults(results);
      }
    } catch (error) {
      console.error('Error fetching game results HERE: ', error);
    }
  };

  // Check if gameData is passed and save it to Firestore
  useEffect(() => {
    if (gameData) {
      const newGameResult = {
        uid: currentUserUid,
        date: new Date().toISOString(),
        guesses: gameData.guesses,
        colors: gameData.colors, // If you need to save colors as well
      };
      saveGameResult(newGameResult);
    }
  }, [gameData, currentUserUid]);

  useEffect(() => {
    // Fetch game results on component mount
    fetchGameResults();
  }, [currentUserUid,gameData]);

  

  return (
    <ScrollView style={styles.container}>
      {gameResults.map(result => (
        <View key={result.id} style={styles.resultContainer}>
          <Text>Date: {new Date(result.date).toLocaleString()}</Text>
          <Text>Guesses:</Text>
          {result.guesses.map((guess, index) => (
            <Text key={index}>{guess}</Text>
          ))}
          <Text>Result (Emoji):</Text>
          <Text>{getEmojiString(result.colors)}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  resultContainer: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default GameResultsScreen;