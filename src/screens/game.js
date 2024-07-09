
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Alert } from 'react-native';
import { colors, CLEAR, ENTER } from '../constants';
import Keyboard from '..';
import { useRoute, useNavigation } from '@react-navigation/native'; // Import hooks for route and navigation
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../firebaseConfig.js';
import Modal from '../components/modal.js';

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
  // set guess equal to the word formed by the letters on the current row 
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.title === "No Definitions Found") {
      return false;
    }
    else if (data.length > 0) {
      return true;
    }
  } catch (error) {
    console.error('Error checking if word is valid:', error);
    return false;
  }
}

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
  const [gameState, setGameState] = useState('playing'); //won , lost, or playing
  const [modalVisible, setModalVisible] = useState(false);
  const [userStats, setUserStats] = useState({
    playedGames: 0,
    wins: 0,
    winPercentage: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: new Array(NUMBER_OF_TRIES).fill(0),
  });

  useEffect(() => {
    const initializeGame = async () => {
      const wordOfTheDay = await fetchWordOfTheDay(); // initialize games pauses until fetchword is done 
      if (wordOfTheDay) {
        setWord(wordOfTheDay); // only once we fetcht the word and its valid we set the word
      } else {
        Alert.alert('Error', 'Unable to fetch the word of the day. Please try again later.');
      }
      setRows(new Array(NUMBER_OF_TRIES).fill(new Array(wordOfTheDay.length).fill('')));
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
            guessDistribution: data.guessDistribution || new Array(NUMBER_OF_TRIES).fill(0),
          });
        }
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };


    fetchUserStats(); // why are we calling the function when we just defined it 
  }, [user.uid]);

  useEffect(() => {
    if (gameState !== 'playing') {
      const saveStats = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.data();

          const playedGames = userData.playedGames + 1;
          const wins = gameState === 'won' ? userData.wins + 1 : userData.wins;
          const winPercentage = (wins / playedGames) * 100;
          const currentStreak = gameState === 'won' ? userData.currentStreak + 1 : 0;
          const maxStreak = gameState === 'won' && currentStreak > userData.maxStreak ? currentStreak : userData.maxStreak;

          let guessDistribution = userData.guessDistribution || new Array(NUMBER_OF_TRIES).fill(0);
          if (gameState === 'won') {
            guessDistribution[curRow] = guessDistribution[curRow] + 1;
          }

          const updatedStats = {
            playedGames,
            wins,
            winPercentage,
            currentStreak,
            maxStreak,
            guessDistribution,
          };

          await updateDoc(userDocRef, updatedStats);
          setUserStats(updatedStats);
        } catch (error) {
          console.error('Error saving user stats:', error);
        }
      };

      saveStats(); //what does saveStats do 
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

    if (row >= curRow) {
      return colors.black;
    }

    if (letter === word[col]) {
      return colors.primary;
    }

    if (word.includes(letter)) {
      return colors.secondary;
    }

    return colors.darkgrey;
  };

  const getAllLettersWithColor = (color) => {
    return rows.flatMap((row, i) =>
      row.filter((cell, j) => getCellBGColor(i, j) === color)
    );
  };

  const greenCaps = getAllLettersWithColor(colors.primary);
  const yellowCaps = getAllLettersWithColor(colors.secondary);
  const greyCaps = getAllLettersWithColor(colors.darkgrey);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>WORDLE</Text>
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
        playedGames = {userStats.playedGames}
        winPercentage = {userStats.winPercentage}
        currentStreak = {userStats.currentStreak}
        maxStreak = {userStats.maxStreak}
        guessDistribution={userStats.guessDistribution}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  title: {
    textAlign: 'center',
    fontSize: 32,
    color: colors.lightgrey,
    fontWeight: 'bold',
  },
  map: {
    alignSelf: 'stretch',
    marginVertical: 20,
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
