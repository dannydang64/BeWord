import {useState} from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { colors, CLEAR, ENTER} from './src/constants';
import Keyboard from './src/components/Keyboard'
import React from 'react';

const NUMBER_OF_TRIES = 6; 

const copyArray = (arr) => {
  return [...arr.map((rows) => [...rows])];
};

export default function App() {
  const word = "hello";
  const letters = word.split(""); // returns an array of letters ['h','e','l','l','o']

//we need to be able to keep in state all of the tries
  const [rows, setRows] = useState(new Array(NUMBER_OF_TRIES).fill(
    new Array(letters.length).fill(""))   // initial state 
);

  const [curRow, setCurRow] = useState(0);
  const [curCol, setCurCol] = useState(0);

  const onKeyPressed = (key) => {
    
    const updatedRows = copyArray(rows);

    if(key === CLEAR && curCol <= rows[0].length){
      prevCol = curCol -1
      if(prevCol >= 0){  // if ur on the first cell you can just return since it must be empty
      updatedRows[curRow][prevCol] = "";
      setRows(updatedRows);
      setCurCol(prevCol);
       // we have to this so that we dont still update the value of key
      }
      return;
    }

    if (key === ENTER){
      if(curCol === rows[0].length){
        setCurRow(curRow + 1);
        setCurCol(0);
      }
       return;
    }

    if (curCol < rows[0].length){
    updatedRows[curRow][curCol] = key;
    setRows(updatedRows);
    setCurCol(curCol + 1);
    }
    else {
      return;
    }
  }

  const isCellActive = (row,col) => {
    return row === curRow && col === curCol;
  };

  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Text style= {styles.title}>BeWord</Text>

      <View style = {styles.map}>
        {rows.map ((row, i) => (  // for every row render a row 
          // these are back ticks that wrap the key value 
          <View key={`row-${i}`} style = {styles.row}>  
          {row.map((cell, j) => (  //mapping each letter to a cell 
          //note that we wrap border color in {} becasue its an object 
            <View 
            key= {`cell-${i}-${j}`}
            style = {[styles.cell, 
              {
              borderColor:
               isCellActive(i, j) 
               ? colors.lightgrey 
               : colors.darkgrey,
               }]}>
              <Text style = {styles.cellText}>{cell.toUpperCase()}</Text>
            </View>
            ))}
        </View>

        ))}

      </View>

      <Keyboard onKeyPressed={onKeyPressed} />
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
  
  map:{
    //backgroundColor: "red",
    alignSelf: 'stretch',
    height:100,
  },

  row:{
    //backgroundColor: "blue",
    marginTop: 12, // added this for heading in the future
    alignSelf: 'stretch',
    flexDirection: 'row', // go in the same direction as the row
    justifyContent: "center"
  },

  cell:{
    borderWidth: 1,
    borderColor: colors.darkgrey,
    borderWidth: 2,
    flex: 1, //evenly sapce between the children 
    height:30,
    aspectRatio:1,  // makes the cell a square. if changed to 1/2 would be doulbe the height
    margin: 3, 
    //combination of these styles creates a square 

    //create a maxwidth
    maxWidth:70,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cellText:{
    color: colors.lightgrey,
    fontSize: 32,
    fontWeight: "bold", 
  }

});
