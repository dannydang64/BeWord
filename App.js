import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { colors } from './src/constants';
import Keyboard from './src/components/Keyboard'

const NUMBER_OF_TRIES = 6; 

export default function App() {
  const word = "hello";
  const letters = word.split(''); // returns an array of letters ['h','e','l','l','o']


  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Text style= {styles.title}>BeWord</Text>

      <View style = {styles.map}>
        <View style = {styles.row}>
          {letters.map(letter => <View style = {styles.cell}></View> )}
        </View>
        
      </View>

      <Keyboard></Keyboard>
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
    marginTop: 30, // added this for heading in the future
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
    maxWidth:70
  },

});
