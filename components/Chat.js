import React, { useState, useEffect } from "react";
import { StyleSheet, View, Platform, KeyboardAvoidingView, Alert } from "react-native";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomActions from "./CustomActions";
import MapView from "react-native-maps";

const Chat = ({ route, navigation, db, storage, isConnected }) => {
  const { name, backgroundColor, userID } = route.params; // Receive name, backgroundColor, and userID from Start screen
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Set the navigation bar title to the user's name
    navigation.setOptions({ title: name });

    const fetchMessages = async () => {
      if (isConnected) {
        // Create a Firestore query to fetch messages in descending order
        const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const newMessages = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              _id: doc.id,
              text: data.text || "",
              createdAt: data.createdAt?.toDate() || new Date(),
              user: data.user,
              image: data.image || null,
              location: data.location || null,
            };
          });
          setMessages(newMessages);

          try {
            // Cache the messages locally for offline use
            await AsyncStorage.setItem("cachedMessages", JSON.stringify(newMessages));
          } catch (error) {
            console.error("Error caching messages:", error);
          }
        });

        // Cleanup listener when the component unmounts
        return () => unsubscribe();
      } else {
        try {
          // Load cached messages when offline
          const cachedMessages = await AsyncStorage.getItem("cachedMessages");
          if (cachedMessages) setMessages(JSON.parse(cachedMessages));
        } catch (error) {
          console.error("Error loading cached messages:", error);
        }
      }
    };

    fetchMessages();
  }, [db, isConnected]);

  // Send a new message to Firestore
  const onSend = (newMessages) => {
    const [message] = newMessages;

    addDoc(collection(db, "messages"), {
      _id: message._id,
      text: message.text || "",
      createdAt: serverTimestamp(),
      user: message.user,
      image: message.image || null,
      location: message.location || null,
    });

    setMessages((prev) => GiftedChat.append(prev, newMessages));
  };

  // Render input toolbar only when the user is online
  const renderInputToolbar = (props) => (isConnected ? <InputToolbar {...props} /> : null);

  // Render custom action buttons (e.g., for sending images or locations)
  const renderCustomActions = (props) => (
    <CustomActions userID={userID} name={name} storage={storage} onSend={(message) => onSend([message])} {...props} />
  );

  // Render custom view for messages (e.g., location map view)
  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={styles.mapView}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor || "#fff" }]}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{ _id: userID, name }}
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: { backgroundColor: "#000" },
              left: { backgroundColor: "#FFF" },
            }}
          />
        )}
        renderInputToolbar={renderInputToolbar}
        renderActions={renderCustomActions}
        renderCustomView={renderCustomView}
      />
      {/* Add keyboard avoiding behavior for Android and iOS */}
      {Platform.OS === "android" ? <KeyboardAvoidingView behavior="height" /> : null}
      {Platform.OS === "ios" ? <KeyboardAvoidingView behavior="padding" /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapView: {
    width: 150,
    height: 100,
    borderRadius: 13,
    margin: 3,
  },
});

export default Chat;