import CustomActions from "./CustomActions";

import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { useState, useEffect } from "react";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
 
} from "react-native-gifted-chat";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import AsyncStorage from "@react-native-async-storage/async-storage";



const Chat = ({ route, navigation, db, isConnected, storage }) => {
  const { userID, name, selectedColor } = route.params; // Get user ID, name and background color from route
  const [messages, setMessages] = useState([]);

  let unsubscribe;

  // Cache function to store messages
  const cacheMessages = async (messages) => {
    try {
      await AsyncStorage.setItem("cachedMessages", JSON.stringify(messages));
    } catch (error) {
      console.error(error);
    }
  };

  // Function to load cached messages when offline
  const loadCachedMessages = async () => {
    try {
      const cachedMessages = await AsyncStorage.getItem("cachedMessages");
      if (cachedMessages) {
        setMessages(JSON.parse(cachedMessages));
      }
    } catch (error) {
      console.error("Error loading cached messages: ", error);
    }
  };

  // Fetch messages and listen for updates
  useEffect(() => {
    if (isConnected === true) {
      // unsubscribe previous onSnapshot listener
      if (unsubscribe) unsubscribe();
      unsubscribe = null;

      // Query Firestore messages ordered by "createdAt"
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));

      // Listen for changes and fetch messages from Firestore
      unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            _id: doc.id,
            text: data.text,
            createdAt: data.createdAt.toDate(), // Convert Firestore Timestamp to JavaScript Date
            user: {
              _id: data.user._id,
              name: data.user.name,
            },
            location: data.location || null, // Include location if it exists
            image: data.image || null, // Include image file if it exists
          };
        });

        // Cache the fetched messages
        cacheMessages(messagesList);

        // Update the state with the new messages
        setMessages(messagesList);
      });
    } else {
      // Load cached messages if offline
      loadCachedMessages();
    }

    // Cleanup on component unmount or when the connection changes
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected]); // Trigger useEffect when the connection status changes

  // Handle sending new messages
  const onSend = (newMessages) => {
    addDoc(collection(db, "messages"), newMessages[0]);
  };

  // Customize the chat bubble style
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: "#6D7883", // Sent bubble color
          },
          left: {
            backgroundColor: "#EAEAEA", // Received bubble color
          },
        }}
        textStyle={{
          right: {
            color: "#FFFFFF", // Sent text color
          },
          left: {
            color: "#333333", // Received text color
          },
        }}
      />
    );
  };

  // Disable the input toolbar when offline
  const renderInputToolbar = (props) => {
    if (isConnected) return <InputToolbar {...props} />;
    else return null;
  };

  // Render the custom actions component
  const renderCustomActions = (props) => {
    return (
      <CustomActions
        {...props}
        onSend={onSend}
        userID={userID}
        name={name}
        storage={storage}
      />
    );
  };

  // Render the custom view for the map
  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <View style={styles.mapContainer}>
          {/* Apply borderRadius and overflow */}
          <MapView
            style={styles.map}
            region={{
              latitude: currentMessage.location.latitude,
              longitude: currentMessage.location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          />
        </View>
      );
    }

    return null;
  };

  // Set nav title to user's name
  useEffect(() => {
    navigation.setOptions({ title: name });
  }, [name, navigation]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: selectedColor || "#090C08" }, // Fallback background color if none selected
      ]}
    >
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderActions={renderCustomActions}
        renderCustomView={renderCustomView}
        onSend={(newMessages) => onSend(newMessages)}
        user={{
          _id: userID,
          name: name, // Load from route.params
        }}
      />
      {Platform.OS === "android" ? (
        <KeyboardAvoidingView behavior="height" /> // Android keyboard optimization
      ) : null}
      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView behavior="padding" /> // iOS keyboard optimization
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    width: 150,
    height: 100,
    borderRadius: 13,
    margin: 3,
    overflow: "hidden", // Ensures the map doesn't extend beyond the rounded corners
  },
  map: {
    ...StyleSheet.absoluteFillObject, // Ensures the map fills the container
  },
});

export default Chat;