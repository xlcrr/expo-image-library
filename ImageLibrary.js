import React, { Component } from 'react';
import {
  Button,
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableHighlight,
  View
} from 'react-native';
import * as Permissions from 'expo-permissions';
import * as MediaLibrary from 'expo-media-library';
const { width } = Dimensions.get('window');
import ImageTile from './ImageTile';

class ImageLibrary extends Component {

  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      albums: [],
      photos: [],
      selected: {},
      after: null,
      has_next_page: false,
      permissionGranted: null
    };
  }

  componentDidMount() {

    this._isMounted = true;
    this.getPhotos();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderHeader()}
        {this.renderImages()}
      </View>
    );
  }

  // this is run multiple times to get more photos.
  async getPhotos(last) {

    // has the "last" photo been passed?
    if (! last) var last = null;

    let pics = await MediaLibrary.getAssetsAsync({
       after: last,
       first: 50,
       sortBy: [[ MediaLibrary.SortBy.default, true ]]
    });

    last = pics['endCursor'];

    let promises = [];
    for (var i = 0; i < pics['assets'].length; i++) {
      promises.push(MediaLibrary.getAssetInfoAsync(pics['assets'][i].id));
    }

    let a = await Promise.all(promises);

    let photos = [];
    for (var i = 0; i < promises.length; i++) {
        photos.push({
          id: a[i].id, // "F719041D-8A97-4156-A2D9-E25C6CA263AC/L0/001",
          uri: a[i].uri, // "assets-library://asset/asset.JPG?id=F719041D-8A97-4156-A2D9-E25C6CA263AC&ext=JPG",
          file: a[i].localUri, // "file:///var/mobile/Media/DCIM/116APPLE/IMG_6677.JPG",
          identity: identity,
          unix: a[i].creationTime
        });
    }

    if (this._isMounted) {
      console.log("UPDATING STATE");
      this.setState({
        photos: [...this.state.photos, ...photos]
      });

      // hacky way to call this function recursively :-/
      if (this.state.photos.length < 1000) {
        this.done(last);
      }
    }
  }

  done(after) {
    console.log("Done -- get more photos");
    this.getPhotos(after);
  }

  renderHeader = () => {
    console.log("... render header ....");
    let selectedCount = Object.keys(this.state.selected).length;
    let headerText = selectedCount + ' Selected';
    if (selectedCount === this.state.max) headerText = headerText + ' (Max)';
    return (
      <View style={styles.header}>
        <Button
          title="Exit"
          onPress={() => {
            this.props.toggleImageBrowser();
          }}
        />
        <Text>{headerText}</Text>
        <Button
          title="Choose"
          onPress={() => {
            this.chooseImages()
          }}
        />
      </View>
    );
  }

  renderImages() {
    console.log("... render images ...");
    return (
      <FlatList
        data={this.state.photos}
        numColumns={4}
        renderItem={this.renderImageTile.bind(this)}
        keyExtractor={item => item.filename}
        ListEmptyComponent={<Text>Loading...</Text>}
        removeClippedSubviews={true}
        onEndReachedThreshold={0.5}
        getItemLayout={this.getItemLayout.bind(this)}
        initialNumToRender={24}
        removeClippedSubviews={true}
      />
    );
  }

  renderImageTile({ item, index }){
    // console.log("-- render image tile --", index);
    let selected = this.state.selected[index] ? true : false;
    return (
      <ImageTile
        item={item.uri}
        index={index}
        selected={selected}
        selectImage={this.selectImage}
      />
    );
  }

  selectImage = (index) => {
    console.log("... Select image ...", index);
    let newSelected = {...this.state.selected};
    if (newSelected[index]) {
      delete newSelected[index];
    } else {
      newSelected[index] = true; // { 0: "true", 1: "true", ... }
    }
    if (Object.keys(newSelected).length > this.state.max) return;
    if (!newSelected) newSelected = {};
    this.setState({ selected: newSelected })
  }

  getItemLayout(data,index){
    // console.log("--- get item layout ---", index);
    let length = width/4;
    return { length, offset: length * index, index }
  }

  chooseImages = async() => {
    console.log("... choose images ...");
    let { selected, photos } = this.state;
    let selectedPhotos = photos.filter((item, index)=> {
      // console.log(index);
      // console.log(item);
      return (selected[index]);
    });
    console.log("Selected Photos", selectedPhotos);
  }
}

const styles = {
  container: {
    flex: 1
  },
  header: {
    height: 40,
    width: width,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20
  }
}

export default ImageLibrary;
