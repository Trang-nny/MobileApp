import React from "react";
import { NavigationContainer }      from "@react-navigation/native";
import { createStackNavigator }     from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons }                 from "@expo/vector-icons";

import HomeScreen             from "../screens/HomeScreen";
import MovieDetailScreen      from "../screens/MovieDetailScreen";
import FavoritesScreen        from "../screens/FavoritesScreen";
import ProfileScreen          from "../screens/ProfileScreen";
import LoginScreen            from "../screens/LoginScreen";
import RegisterScreen         from "../screens/RegisterScreen";
import HistoryScreen          from "../screens/HistoryScreen";
import VideoPlayerScreen      from "../screens/VideoPlayerScreen";
import EditProfileScreen      from "../screens/EditProfileScreen";

import AdminDashboardScreen   from "../screens/AdminDashboardScreen";
import AdminMoviesScreen      from "../screens/AdminMoviesScreen";
import AdminGenresScreen      from "../screens/AdminGenresScreen";
import AdminUsersScreen       from "../screens/AdminUsersScreen";

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: "#000",
                    borderTopColor: "#1c1c1c",
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarActiveTintColor:   "#fff",
                tabBarInactiveTintColor: "#555",
                tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
                tabBarIcon: ({ focused, color, size }) => {
                    const map = {
                        Home:      focused ? "home"   : "home-outline",
                        Favorites: focused ? "heart"  : "heart-outline",
                        Profile:   focused ? "person" : "person-outline",
                    };
                    return <Ionicons name={map[route.name]} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home"      component={HomeScreen}      options={{ title: "Trang Chủ" }} />
            <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: "Yêu Thích" }} />
            <Tab.Screen name="Profile"   component={ProfileScreen}   options={{ title: "Cá Nhân"   }} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle:      { backgroundColor: "#141414", shadowColor: "transparent", elevation: 0 },
                    headerTintColor:  "#fff",
                    headerTitleStyle: { fontWeight: "bold", fontSize: 17 },
                    cardStyle:        { backgroundColor: "#0a0a0a" },
                }}
            >
                {/* ── Tab chính ── */}
                <Stack.Screen
                    name="MainTabs"
                    component={MainTabs}
                    options={{ headerShown: false }}
                />

                {/* ── Chi tiết phim ── */}
                <Stack.Screen
                    name="MovieDetail"
                    component={MovieDetailScreen}
                    options={{ title: "Chi Tiết Phim" }}
                />

                {/* ── Auth ── */}
                <Stack.Screen name="Login"    component={LoginScreen}    options={{ headerShown: false }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />

                {/* ── Người dùng ── */}
                <Stack.Screen name="History"     component={HistoryScreen}     options={{ title: "Lịch Sử Xem" }} />
                <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} options={{ title: "Đang Xem", headerShown: false }} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Chỉnh Sửa Hồ Sơ" }} />

                {/* ── Admin ── */}
                <Stack.Screen
                    name="AdminDashboard"
                    component={AdminDashboardScreen}
                    options={{ title: "Bảng Điều Khiển Admin" }}
                />
                <Stack.Screen
                    name="AdminMovies"
                    component={AdminMoviesScreen}
                    options={{ title: "Quản Lý Phim" }}
                />
                <Stack.Screen
                    name="AdminGenres"
                    component={AdminGenresScreen}
                    options={{ title: "Quản Lý Thể Loại" }}
                />
                <Stack.Screen
                    name="AdminUsers"
                    component={AdminUsersScreen}
                    options={{ title: "Quản Lý Người Dùng" }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}