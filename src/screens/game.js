import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Alert } from 'react-native';
import { colors, CLEAR, ENTER } from '../constants';
import Keyboard from '..';
import { useRoute, useNavigation } from '@react-navigation/native'; // Import hooks for route and navigation

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



  const [word, setWord] = useState('');
  const [rows, setRows] = useState([]);
  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);
  const [gameState, setGameState] = useState('playing'); //won , lost, or playing

  useEffect(() => {
    const initializeGame = async () => {
      const wordOfTheDay = await fetchWordOfTheDay(); // initialize games pauses until fetchword is done 
      if (wordOfTheDay) {
        setWord(wordOfTheDay); // only once we fetcht the word and its valid we set the word
        setRows(new Array(NUMBER_OF_TRIES).fill(new Array(wordOfTheDay.length).fill(""))); // initial state
      }
    };
    initializeGame();
  }, []); // empty array represents the dependencies that determine when useEffect should run
  // if anything in the array would change then useEffect would rerun 

  useEffect(() => {
    if (curRow > 0) {
      checkGameState();
    }
  }, [curRow])

  const checkGameState = () => {
    if (checkIfWon()) {
      setGameState('won');
      Alert.alert('hip hip hurray, ur so smart')
    }
    else if (checkIfLost()) {
      setGameState('lost');
      Alert.alert('LMAOOOOOOOO. maybe tmmrw lil bro. the ansswer is: ', word.toUpperCase())
    }
  }

  const checkIfWon = () => {
    const row = rows[curRow - 1];
    return row.every((letter, i) => letter === word[i]);
  }

  const checkIfLost = () => {
    return curRow === rows.length;
  }

  const onKeyPressed = async (key) => { //added async here due to checkWord 
    if (gameState !== 'playing') {
      return;
    }

    const updatedRows = copyArray(rows);

    if (key === CLEAR && curCol <= rows[0].length) {
      const prevCol = curCol - 1;
      if (prevCol >= 0) { // if ur on first cell just return since your cell must be empty 
        updatedRows[curRow][prevCol] = "";
        setRows(updatedRows);
        setCurCol(prevCol);  // we do this so that we delete the cell before not the empty one were on
      }
      return;
    }

    if (key === ENTER) {
      // checkValidWord (curRow)
      const curWord = updatedRows[curRow].join('');
      const isValidWord = await checkValidWord(curWord);
      if (!isValidWord) {
        console.log("curr Word: ", curWord,);
        console.log("is valid word: ", isValidWord);
        Alert.alert('Invalid word, please try again.');
      }
      if (curCol === rows[0].length && isValidWord) {
        setCurRow(curRow + 1);
        setCurCol(0);
      }
      return;
    }

    if (curCol < rows[0].length) {
      updatedRows[curRow][curCol] = key;
      setRows(updatedRows);
      setCurCol(curCol + 1);
    } else {
      return;
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>BeWord</Text>

      <View style={styles.map}>
        {rows.map((row, i) => ( // for every row render a row 
          <View key={`row-${i}`} style={styles.row}>
            {row.map((letter, j) => (
              <View
                key={`cell-${i}-${j}`}
                style={[
                  styles.cell,
                  {
                    borderColor: isCellActive(i, j) ? colors.lightgrey : colors.darkgrey,
                    backgroundColor: getCellBGColor(i, j),
                  }
                ]}
              >
                <Text style={styles.cellText}>{letter.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <Keyboard
        onKeyPressed={onKeyPressed}
        greenCaps={greenCaps}
        yellowCaps={yellowCaps}
        greyCaps={greyCaps}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: 'center',
  },
  title: {
    color: colors.lightgrey,
    fontSize: 35,
    fontWeight: "bold",
    letterSpacing: 7,
  },
  map: {
    alignSelf: 'stretch',
    height: 100,
  },
  row: {
    marginTop: 12,
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: "center",
  },
  cell: {
    borderWidth: 2,
    flex: 1,
    height: 30,
    aspectRatio: 1,
    margin: 3,
    maxWidth: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    color: colors.lightgrey,
    fontSize: 32,
    fontWeight: "bold",
  }
});

export default Game;
