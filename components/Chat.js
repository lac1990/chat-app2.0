import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Chat = ({ route, navigation, db, isConnected }) => {
  const {userID, name, selectedColor} = route.params; // Get user ID, name and color from route
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
            createdAt: data.createdAt.toDate(), // Convert Firestore Timestamp to JavaScript Date
            text: data.text,
            user: {
          _id: data.userID,
              name: data.user.name,
            },
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
  }, [isConnected]); // Ensure useEffect runs when the connection status changes

  // Handle sending new messages
  const onSend = async (newMessages) => {
    const message = newMessages[0];
    try {
      await addDoc(collection(db, "messages"), {
        createdAt: new Date(),
        text: message.text,
        user: message.user,
      });
    } catch (error) {
      console.error("Error sending message: ", error);
    }
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
        onSend={messages => onSend(messages)}
        user={{

          _id: userID, // Use a fixed user ID (replace with your actual user ID logic)
          name: name, // Use the name passed in from route.params
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
});

export default Chat;