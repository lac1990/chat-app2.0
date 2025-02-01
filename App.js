import React, { useEffect } from "react";
import { Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNetInfo } from "@react-native-community/netinfo";

// Firebase imports
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, disableNetwork, enableNetwork } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Import screens
import Start from "./components/Start";
import Chat from "./components/Chat";

const Stack = createNativeStackNavigator();
const App = () => {
  //firebase credentials 
  const firebaseConfig = {
    apiKey: "AIzaSyD5vCtdIYHxmqv2RTZMFOjSfMfEz2eKA80",
    authDomain: "chat-app-42346.firebaseapp.com",
    projectId: "chat-app-42346",
    storageBucket: "chat-app-42346.firebasestorage.app",
    messagingSenderId: "344701913106",
    appId: "1:344701913106:web:943b686567d5cf28ab30cb",
    measurementId: "G-VL1851BNML"
  };


  // Initialize Firebase app
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const analytics = getAnalytics(app);
  // Firebase services
  const db = getFirestore(app);
  const storage = getStorage(app);
  const auth =
    getApps().length === 0
      ? initializeAuth(app, { persistence: ReactNativeAsyncStorage })
      : getAuth(app);

  // Connection status
  const connectionStatus = useNetInfo();

  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert("Connection lost!");
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        {/* Start screen for entering user details */}
        <Stack.Screen name="Start" component={Start} />
        {/* Chat screen, passing props to configure the chat */}
        <Stack.Screen name="Chat">
          {(props) => (
            <Chat
              isConnected={connectionStatus.isConnected}
              db={db}
              storage={storage}
              auth={auth}
              {...props}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;