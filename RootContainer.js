import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-elements';
import * as Permissions from 'expo-permissions';
import ImageLibrary from './ImageLibrary';

class RootContainer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      libraryOpen: false,
      permissionGranted: null
    };
  }

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

    if (status === "granted") {
      this.setState({ permissionGranted: true });
    }
  }

  render() {

    if (this.state.libraryOpen) {
      return <ImageLibrary />;
    }

    return (
      <View style={styles.container}>
        <Button title="Open library" onPress={this.openLibrary.bind(this)} />
      </View>
    );
  }

  openLibrary() {
    this.setState({
      libraryOpen: true
    });
  }
}

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
}

export default RootContainer;
