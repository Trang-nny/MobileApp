import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/actions";

const LoginScreen = ({ navigation }) => {
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const dispatch    = useDispatch();
    const authLoading = useSelector(s => s.authLoading);
    const authError   = useSelector(s => s.authError);
    const token       = useSelector(s => s.token);

    // Khi token xuất hiện (đăng nhập thành công) → tự động quay về
    useEffect(() => {
        if (token) {
            navigation.reset({
                index: 0,
                routes: [{ name: "MainTabs" }],
            });
        }
    }, [token]);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
            return;
        }
        await dispatch(login(email, password));
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Text style={styles.logo}>🎬 MovieApp</Text>
            <Text style={styles.title}>Đăng nhập</Text>

            {authError ? <Text style={styles.error}>{authError}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#555"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#555"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TouchableOpacity
                style={[styles.btn, authLoading && { opacity: 0.6 }]}
                onPress={handleLogin}
                disabled={authLoading}
            >
                <Text style={styles.btnText}>
                    {authLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.link}>
                    Chưa có tài khoản? <Text style={styles.linkRed}>Đăng ký</Text>
                </Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        paddingHorizontal: 28,
    },
    logo: {
        fontSize: 28,
        textAlign: "center",
        marginBottom: 8,
        color: "#ffffff",
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 28,
    },
    error: {
        color: "#e50914",
        textAlign: "center",
        marginBottom: 12,
        fontSize: 13,
    },
    input: {
        backgroundColor: "#1c1c1c",
        color: "#fff",
        borderWidth: 1,
        borderColor: "#2a2a2a",
        borderRadius: 8,
        paddingHorizontal: 14,
        height: 48,
        fontSize: 15,
        marginBottom: 14,
    },
    btn: {
        backgroundColor: "#e50914",
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 6,
        marginBottom: 20,
    },
    btnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    link: {
        color: "#b3b3b3",
        textAlign: "center",
        fontSize: 14,
    },
    linkRed: {
        color: "#e50914",
        fontWeight: "bold",
    },
});

export default LoginScreen;