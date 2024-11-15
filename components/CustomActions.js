import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as Location from "expo-location";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

const CustomActions = ({ wrapperStyle, onSend, userID, name, storage }) => {
  const actionSheet = useActionSheet(); // Define ActionSheet options
  const onActionPress = () => {
    const options = [
      "Choose From Library",
      "Take Picture",
      "Send Location",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;
    actionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            pickImage();
            return;
          case 1:
            takePhoto();
            return;
          case 2:
            getLocation();
            return;
          default:
        }
      }
    );
  };

  const generateReference = (uri) => {
    // Generate unique file name for image
    const timeStamp = new Date().getTime();
    const imageName = uri.split("/")[uri.split("/").length - 1];
    return `${userID}-${timeStamp}-${imageName}`;
  };

  const uploadAndSendImage = async (imageURI) => {
    // Upload loginc used in pickImage and takePhoto
    const uniqueRefString = generateReference(imageURI);
    const newUploadRef = ref(storage, uniqueRefString);
    const response = await fetch(imageURI);
    const blob = await response.blob();
    uploadBytes(newUploadRef, blob).then(async (snapshot) => {
      const imageURL = await getDownloadURL(snapshot.ref);
      onSend([
        {
          image: imageURL,
          createdAt: new Date(),
          user: {
            _id: userID,
            name: name,
          },
        },
      ]);
    });
  };

  const pickImage = async () => {
    // Pick and image from device gallery
    let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissions?.granted) {
      let result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
      else Alert.alert("Permissions haven't been granted.");
    }
  };

  const takePhoto = async () => {
    // Take a photo using device camera
    let permissions = await ImagePicker.requestCameraPermissionsAsync();
    if (permissions?.granted) {
      let result = await ImagePicker.launchCameraAsync();
      if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
      else Alert.alert("Permissions haven't been granted.");
    }
  };

  const getLocation = async () => {
    // Get device's location data
    let permission = await Location.requestForegroundPermissionsAsync();
    if (permission?.granted) {
      let location = await Location.getCurrentPositionAsync({});
      if (location) {
        onSend([
          {
            createdAt: new Date(),
            user: {
              _id: userID,
              name: name,
            },
            location: {
              longitude: location.coords.longitude,
              latitude: location.coords.latitude,
            },
          },
        ]);
      } else Alert.alert("Error occurred while fetching location");
    } else Alert.alert("Permissions haven't been granted.");
  };

  return (
    <TouchableOpacity // Action button
      accessible={true}
      accessibilityLabel="More options"
      accessibilityHint="Lets you share an image or your geolocation in the chat."
      accessibilityRole="button"
      style={styles.container}
      onPress={onActionPress}
    >
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text>+</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 10,
    backgroundColor: "transparent",
    textAlign: "center",
  },
});

export default CustomActions;