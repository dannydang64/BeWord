import React from 'react';
import { View, Text, StyleSheet, Modal as RNModal, TouchableOpacity } from 'react-native';

const Modal = ({ isCorrect, turn, solution, modalVisible,
  setModalVisible, playedGames, winPercentage,
  currentStreak, maxStreak, guessDistribution }) => {
  return (
    <RNModal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {isCorrect ? (
            <View>
              <Text style={styles.title}>You Win!</Text>
              <Text style={styles.title}>Word of the Day: {solution}</Text>
              <Text style={styles.statLabel}>You found the solution in {turn} guesses</Text>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Played Games: </Text>
                <Text style={styles.statValue}>{playedGames}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Win %: </Text>
                <Text style={styles.statValue}>{winPercentage.toFixed(0)}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Current Streak:</Text>
                <Text style={styles.statValue}>{currentStreak}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Max Streak: </Text>
                <Text style={styles.statValue}>{maxStreak}</Text>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.title}>Game Over: You Lose</Text>
              <Text style={styles.title}>Word of the Day: {solution}</Text>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Played Games: </Text>
                <Text style={styles.statValue}>{playedGames}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Win %: </Text>
                <Text style={styles.statValue}>{winPercentage.toFixed(0)}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Current Streak:</Text>
                <Text style={styles.statValue}>{currentStreak}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Max Streak: </Text>
                <Text style={styles.statValue}>{maxStreak}</Text>
              </View>
            </View>
            
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    justifyContent: 'center',
    textAlign: 'center',
  },
  solution: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'blue',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // stats css 
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 18,
  },
  guessDistributionContainer: {
    width: '100%',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  guessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  guessLabel: {
    fontSize: 18,
    width: 20,
  },
  guessBar: {
    height: 20,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guessValue: {
    color: 'white',
    fontSize: 18,
    paddingHorizontal: 5,
  },
});

export default Modal;
