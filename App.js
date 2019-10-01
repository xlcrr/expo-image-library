import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ImageLibrary from './ImageLibrary';
import * as Permissions from 'expo-permissions';

export default function App() {

  return (
    <View style={styles.container}>
      <ImageLibrary />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
