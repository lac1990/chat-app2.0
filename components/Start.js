import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getAuth, signInAnonymously } from "firebase/auth";

const Start = ({ navigation }) => {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const background = require("../img/background-img.png");
  const backgroundColors = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];
  const isDisabled = !name.trim(); // Disabled state for the button

  const auth = getAuth();

  // Anonymous sign-in funciton
  const signInUser = () => {
    signInAnonymously(auth)
      .then((result) => {
        navigation.navigate("Chat", {
          userID: result.user.uid,
          name: name,
          selectedColor: selectedColor,
        });
      })
      .catch((error) => {
        Alert.alert("Unable to sign in, try later again.");
      });
  };

  return (
    <ImageBackground
      source={background}
      resizeMode="cover"
      style={styles.background}
    >
      {/* App Title */}
      <Text style={styles.appTitle}>Chat App</Text>

      {/* Sign-in form*/}
      <View style={styles.container}>
        <Text style={styles.baseText}>Chatroom login</Text>

        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={(text) => setName(text)}
          placeholder="What's your name?"
          placeholderTextColor="rgba(117, 112, 131, 0.5)" // #757083 with 50% opacity
        />

        <Text style={styles.baseText}>Choose background color:</Text>

        <View style={styles.colorContainer}>
          {backgroundColors.map((color, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.colorCircle,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColorCircle,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, isDisabled && styles.buttonDisabled]} // Conditionally disabled button
          onPress={signInUser}
          disabled={isDisabled}
        >
          <Text
            style={[styles.buttonText, isDisabled && styles.buttonTextDisabled]}
          >
            Enter chatroom
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  appTitle: {
    fontSize: 45,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#fff",
  },
  baseText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    opacity: 1,
  },
  container: {
    width: "88%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 10,
  },
  textInput: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    marginTop: 15,
    marginBottom: 15,
    borderColor: "#ccc",
    borderRadius: 5,
    fontSize: 16,
    fontWeight: "300",
  },
  errorText: {
    color: "red",
    marginBottom: 15,
  },
  colorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: 10,
  },
  selectedColorCircle: {
    borderWidth: 2,
    borderColor: "#000",
  },
  button: {
    width: "88%",
    padding: 15,
    backgroundColor: "#757083",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

export default Start;