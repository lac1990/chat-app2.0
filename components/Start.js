import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { getAuth, signInAnonymously } from "firebase/auth";

const Start = ({ navigation }) => {
  // State to store user's input name
  const [name, setName] = useState("");
  // State to store selected background color, with a default value
  const [backgroundColor, setBackgroundColor] = useState("#090C08");

  // Firebase Authentication instance
  const auth = getAuth();

  // Anonymous sign-in function for Firebase
  const signInUser = () => {
    signInAnonymously(auth)
      .then((result) => {
        // Navigate to Chat screen with userID, name, and backgroundColor
        navigation.navigate("Chat", {
          userID: result.user.uid, // Firebase User ID
          name: name || "User", // Use "User" as a fallback if no name is entered
          backgroundColor, // Pass the selected background color
        });
        Alert.alert("Signed in successfully!");
      })
      .catch((error) => {
        console.error("Error during anonymous sign-in:", error);
        Alert.alert("Unable to sign in. Please try again later.");
      });
  };

  // Array of color options for users to choose their preferred background
  const colors = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        {/* Background image for the Start screen */}
        <ImageBackground
          source={require("../img/background-img.png")}
          style={styles.background}
        >
          <View style={styles.contentContainer}>
            {/* App title */}
            <Text style={styles.title}>Welcome to ChatApp!</Text>

            {/* Input and color selection section */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter Your Name"
                placeholderTextColor="#757083"
              />

              <Text style={styles.colorText}>Choose Background Color:</Text>
              <View style={styles.colorContainer}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      backgroundColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setBackgroundColor(color)}
                  />
                ))}
              </View>

              {/* Button to start chatting */}
              <TouchableOpacity
                style={styles.button}
                onPress={signInUser}
              >
                <Text style={styles.buttonText}>Start Chatting</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: "20%",
  },
  title: {
    fontSize: 45,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 40,
  },
  inputContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "88%",
    alignItems: "center",
  },
  textInput: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#757083",
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    opacity: 0.5,
  },
  colorText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    marginBottom: 10,
  },
  colorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  selectedColor: {
    borderWidth: 2,
    borderColor: "#757083",
  },
  button: {
    backgroundColor: "#757083",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Start;