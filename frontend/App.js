import React from "react";
import { StatusBar } from "expo-status-bar";
import { Provider }  from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import store         from "./redux/index";
import AppNavigator  from "./routes/AppNavigator";

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <StatusBar style="light" backgroundColor="#000000" />
                <AppNavigator />
            </Provider>
        </GestureHandlerRootView>
    );
} 