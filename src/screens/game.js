import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { colors, CLEAR, ENTER } from '../constants';
import Keyboard from '..';
import { useRoute, useNavigation } from '@react-navigation/native'; // Import hooks for route and navigation
import { getFirestore, doc, updateDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig.js';
import Modal from '../components/modal.js';
import UserSearchScreen from './userSearchScreen.js';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import the icon library

const NUMBER_OF_TRIES = 6;

const copyArray = (arr) => {
  return [...arr.map((rows) => [...rows])];
};

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const fetchWordOfTheDay = async () => {
  const date = getTodayDate();
  const url = `https://www.nytimes.com/svc/wordle/v2/${date}.json`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.solution;
  } catch (error) {
    console.error('Error fetching the Wordle word of the day:', error);
    return null;
  }
};

const checkValidWord = async (guess) => {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.title === "No Definitions Found") {
      return false;
    } else if (data.length > 0) {
      return true;
    }
  } catch (error) {
    console.error('Error checking if word is valid:', error);
    return false;
  }
};

const Game = () => {
  const route = useRoute(); // Hook to access route parameters
  const navigation = useNavigation(); // Hook to access navigation object
  const { user } = route.params;

  const db = getFirestore(app);
  const auth = getAuth(app);

  const [word, setWord] = useState('');
  const [rows, setRows] = useState([]);
  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);
  const [gameState, setGameState] = useState('playing'); // won, lost, or playing
  const [modalVisible, setModalVisible] = useState(false);
  const [userStats, setUserStats] = useState({
    playedGames: 0,
    wins: 0,
    winPercentage: 0,
    currentStreak: 0,
    maxStreak: 0,
  });

  const fetchGameResults = async () => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      //console.log('Game results:', userData?.gameResults || []);
    } catch (error) {
      console.error('Error fetching game results:', error);
    }
  };

  useEffect(() => {
    fetchGameResults(); // Fetch game results for the current user
  }, [user.uid]);

  useEffect(() => {
    const initializeGame = async () => {
      const wordOfTheDay = await fetchWordOfTheDay();
      console.log(wordOfTheDay);
      if (wordOfTheDay) {
        setWord(wordOfTheDay);
        setRows(new Array(NUMBER_OF_TRIES).fill(new Array(wordOfTheDay.length).fill('')));
      } else {
        Alert.alert('Error', 'Unable to fetch the word of the day. Please try again later.');
      }
    };
    initializeGame();
  }, []);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserStats({
            playedGames: data.playedGames || 0,
            wins: data.wins || 0,
            winPercentage: data.winPercentage || 0,
            currentStreak: data.currentStreak || 0,
            maxStreak: data.maxStreak || 0,
            // gameResults: data.gameResults || [],
          });
        } else {
          setUserStats({
            playedGames: 0,
            wins: 0,
            winPercentage: 0,
            currentStreak: 0,
            maxStreak: 0,
            // gameResults: [],
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchUserStats();
  }, [user.uid]);

  useEffect(() => {
    if (gameState !== 'playing') {

      const gameData = {
        guesses: rows.map(row => row.join('')),
        colors: rows.map((row, rowIndex) => row.map((_, colIndex) => getCellBGColor(rowIndex, colIndex))),
      };

      console.log('Game Data to be sent:', gameData); // Log gameData to ensure it's correct
      if (gameData.guesses.length > 0) {
        navigation.navigate('GameResultsScreen', { currentUserUid: user.uid, gameData });
      } else {
        console.error('Error: gameData is empty or invalid');
      }

      const saveStats = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data() || {};



          await updateDoc(userDocRef, {
            //gameResults: updatedGameResults, // Add the updated gameResults array
            playedGames: userData.playedGames + 1,
            wins: gameState === 'won' ? userData.wins + 1 : userData.wins,
            winPercentage: ((gameState === 'won' ? userData.wins + 1 : userData.wins) / (userData.playedGames + 1)) * 100,
            currentStreak: gameState === 'won' ? userData.currentStreak + 1 : 0,
            maxStreak: gameState === 'won' && userData.currentStreak + 1 > userData.maxStreak ? userData.currentStreak + 1 : userData.maxStreak,
          });

        } catch (error) {
        }
      };

      saveStats();
      setModalVisible(true);
    }
  }, [gameState, curRow, db, user.uid]);

  const handleKeyPressed = async (key) => {
    if (gameState !== 'playing') return;

    const updatedRows = copyArray(rows);

    if (key === CLEAR) {
      const prevCol = curCol - 1;
      if (prevCol >= 0) {
        updatedRows[curRow][prevCol] = '';
        setRows(updatedRows);
        setCurCol(prevCol);
      }
      return;
    }

    if (key === ENTER) {
      if (curCol === rows[0].length) {
        const guess = updatedRows[curRow].join('');
        const isValidWord = await checkValidWord(guess);
        if (isValidWord) {
          setCurRow(curRow + 1);
          setCurCol(0);
        } else {
          Alert.alert('Invalid Word', 'The guessed word is not valid. Please try again.');
        }

        if (guess === word) {
          setGameState('won');
        } else if (curRow === rows.length - 1) {
          setGameState('lost');
        }

        return;
      }

      Alert.alert('Incomplete Word', 'Please complete the word before submitting.');
      return;
    }

    if (curCol < rows[0].length) {
      updatedRows[curRow][curCol] = key;
      setRows(updatedRows);
      setCurCol(curCol + 1);
    }
  };

  const isCellActive = (row, col) => {
    return row === curRow && col === curCol;
  };

  const getCellBGColor = (row, col) => {
    const letter = rows[row][col];
    const tempLetters = [...word]; // Copy of the word
    const letterCount = {}; // Track the count of each letter in the word

    if (row >= curRow) {
      return colors.black;
    }

    // Count each letter in the word
    for (const char of tempLetters) {
      letterCount[char] = (letterCount[char] || 0) + 1;
    }

    // First pass: Mark correctly placed letters (Green)
    for (let i = 0; i < word.length; i++) {
      if (rows[row][i] === word[i]) {
        letterCount[word[i]]--; // Decrease the count for this letter
      }
    }

    // If the current letter is in the correct position, mark it green
    if (letter === word[col]) {
      return colors.primary; // Green
    }

    // Second pass: Mark letters that exist but are in the wrong position (Yellow)
    for (let i = 0; i < word.length; i++) {
      if (rows[row][i] !== word[i] && letterCount[rows[row][i]] > 0) {
        letterCount[rows[row][i]]--; // Decrease the count for this letter
        if (i === col) {
          return colors.secondary; // Yellow
        }
      }
    }

    return colors.darkgrey; // Dark grey
  };

  const getAllLettersWithColor = (color) => {
    return rows.flatMap((row, i) =>
      row.filter((cell, j) => getCellBGColor(i, j) === color)
    );
  };

  const greenCaps = getAllLettersWithColor(colors.primary);
  const yellowCaps = getAllLettersWithColor(colors.secondary);
  const greyCaps = getAllLettersWithColor(colors.darkgrey);

  const handleAddFriend = () => {
    console.log('Current User UID:', user.uid);
    navigation.navigate('UserSearchScreen', { currentUserUid: user.uid });
  };

  return (
    <ScrollView>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>WORDLE</Text>
          <TouchableOpacity style={styles.iconButton} onPress={handleAddFriend}>
            <Icon name="user" size={24} color={colors.lightgrey} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('GameResultsScreen', { currentUserUid: user.uid })}
          >
            <Icon name="history" size={24} color={colors.lightgrey} />
          </TouchableOpacity>
        </View>
        <View style={styles.map}>
          {rows.map((row, i) => (
            <View key={`row-${i}`} style={styles.row}>
              {row.map((letter, j) => (
                <View
                  key={`cell-${i}-${j}`}
                  style={[
                    styles.cell,
                    {
                      borderColor: isCellActive(i, j) ? colors.grey : colors.darkgrey,
                      backgroundColor: getCellBGColor(i, j),
                    },
                  ]}
                >
                  <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        <Keyboard
          onKeyPressed={handleKeyPressed}
          greenCaps={greenCaps}
          yellowCaps={yellowCaps}
          greyCaps={greyCaps}
        />
        <Modal
          isCorrect={gameState === 'won'}
          turn={curRow}
          solution={word}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          playedGames={userStats.playedGames}
          winPercentage={userStats.winPercentage}
          currentStreak={userStats.currentStreak}
          maxStreak={userStats.maxStreak}
        />
      </SafeAreaView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 32,
    color: colors.lightgrey,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 10,
  },
  map: {
    alignSelf: 'stretch',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cell: {
    borderWidth: 3,
    borderColor: colors.darkgrey,
    flex: 1,
    aspectRatio: 1,
    margin: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    color: colors.lightgrey,
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default Game;
