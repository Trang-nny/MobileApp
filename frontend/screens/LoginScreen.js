import React, { useState, useEffect } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform,
    ScrollView, StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { login } from "../redux/actions";

const LoginScreen = ({ navigation }) => {
    const [email,       setEmail]       = useState("");
    const [password,    setPassword]    = useState("");
    const [showPass,    setShowPass]    = useState(false);
    const dispatch    = useDispatch();
    const authLoading = useSelector(s => s.authLoading);
    const authError   = useSelector(s => s.authError);
    const token       = useSelector(s => s.token);
    const insets      = useSafeAreaInsets();

    useEffect(() => {
        if (token) {
            navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
        }
    }, [token]);

    const handleLogin = async () => {
        if (!email.trim() || !password) return;
        await dispatch(login(email.trim(), password));
    };

    const canGoBack = navigation.canGoBack();

    return (
        <>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
            {canGoBack && (
                <TouchableOpacity
                    style={[styles.backBtn, { top: insets.top + 8 }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
            )}
            <KeyboardAvoidingView
                style={styles.root}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scroll,
                        canGoBack && { paddingTop: insets.top + 56 },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Logo vùng trên ── */}
                    <View style={styles.logoWrap}>
                        <View style={styles.logoIcon}>
                            <Text style={styles.logoEmoji}>🎬</Text>
                        </View>
                        <Text style={styles.logoName}>MovieApp</Text>
                        <Text style={styles.logoTagline}>Xem phim mọi lúc, mọi nơi</Text>
                    </View>

                    {/* ── Form card ── */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Đăng nhập</Text>

                        {/* Thông báo lỗi */}
                        {authError ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={16} color="#e50914" />
                                <Text style={styles.errorText}>{authError}</Text>
                            </View>
                        ) : null}

                        {/* Email */}
                        <View style={styles.inputWrap}>
                            <Ionicons name="mail-outline" size={18} color="#555" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                placeholderTextColor="#555"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                value={email}
                                onChangeText={setEmail}
                                returnKeyType="next"
                            />
                        </View>

                        {/* Mật khẩu */}
                        <View style={styles.inputWrap}>
                            <Ionicons name="lock-closed-outline" size={18} color="#555" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Mật khẩu"
                                placeholderTextColor="#555"
                                secureTextEntry={!showPass}
                                value={password}
                                onChangeText={setPassword}
                                returnKeyType="done"
                                onSubmitEditing={handleLogin}
                            />
                            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                                <Ionicons
                                    name={showPass ? "eye-off-outline" : "eye-outline"}
                                    size={18}
                                    color="#555"
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Nút đăng nhập */}
                        <TouchableOpacity
                            style={[styles.btn, (authLoading || !email || !password) && styles.btnDisabled]}
                            onPress={handleLogin}
                            disabled={authLoading || !email || !password}
                            activeOpacity={0.85}
                        >
                            {authLoading ? (
                                <View style={styles.btnInner}>
                                    <Ionicons name="reload-outline" size={18} color="#fff" />
                                    <Text style={styles.btnText}>Đang đăng nhập...</Text>
                                </View>
                            ) : (
                                <View style={styles.btnInner}>
                                    <Ionicons name="log-in-outline" size={18} color="#fff" />
                                    <Text style={styles.btnText}>Đăng nhập</Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Phân cách */}
                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>hoặc</Text>
                            <View style={styles.divider} />
                        </View>

                        {/* Link đăng ký */}
                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={() => navigation.navigate("Register")}
                        >
                            <Text style={styles.secondaryBtnText}>Tạo tài khoản mới</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <Text style={styles.footer}>
                        Chưa có tài khoản?{" "}
                        <Text
                            style={styles.footerLink}
                            onPress={() => navigation.navigate("Register")}
                        >
                            Đăng ký ngay
                        </Text>
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
};

const styles = StyleSheet.create({
    root:   { flex: 1, backgroundColor: "#0a0a0a" },
    backBtn: {
        position: "absolute", left: 16, zIndex: 10,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 20, padding: 8,
        borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    },
    scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 },

    // Logo
    logoWrap:    { alignItems: "center", marginBottom: 36 },
    logoIcon:    {
        width: 72, height: 72, borderRadius: 20,
        backgroundColor: "#e50914",
        justifyContent: "center", alignItems: "center",
        marginBottom: 14,
        shadowColor: "#e50914",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 16,
        elevation: 10,
    },
    logoEmoji:   { fontSize: 36 },
    logoName:    { color: "#fff", fontSize: 30, fontWeight: "900", letterSpacing: -0.5 },
    logoTagline: { color: "#555", fontSize: 13, marginTop: 6 },

    // Card
    card:      {
        backgroundColor: "#141414",
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: "#222",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 6,
    },
    cardTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 20, letterSpacing: -0.3 },

    // Error
    errorBox:  {
        flexDirection: "row", alignItems: "center", gap: 8,
        backgroundColor: "#e509141a",
        borderWidth: 1, borderColor: "#e5091440",
        borderRadius: 8, padding: 10, marginBottom: 16,
    },
    errorText: { color: "#e50914", fontSize: 13, flex: 1 },

    // Input
    inputWrap: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#1c1c1c",
        borderWidth: 1, borderColor: "#2a2a2a",
        borderRadius: 10, marginBottom: 14,
        paddingHorizontal: 12, height: 52,
    },
    inputIcon: { marginRight: 10 },
    input:     { flex: 1, color: "#fff", fontSize: 15 },
    eyeBtn:    { padding: 4 },

    // Button
    btn: {
        backgroundColor: "#e50914",
        height: 52, borderRadius: 10,
        justifyContent: "center", alignItems: "center",
        marginTop: 4,
    },
    btnDisabled: { opacity: 0.45 },
    btnInner:    { flexDirection: "row", alignItems: "center", gap: 8 },
    btnText:     { color: "#fff", fontSize: 16, fontWeight: "800" },

    // Divider
    dividerRow:  { flexDirection: "row", alignItems: "center", marginVertical: 18, gap: 12 },
    divider:     { flex: 1, height: 1, backgroundColor: "#222" },
    dividerText: { color: "#444", fontSize: 13 },

    // Secondary button
    secondaryBtn: {
        height: 52, borderRadius: 10,
        justifyContent: "center", alignItems: "center",
        borderWidth: 1.5, borderColor: "#333",
        backgroundColor: "transparent",
    },
    secondaryBtnText: { color: "#b3b3b3", fontSize: 15, fontWeight: "600" },

    // Footer
    footer:     { color: "#555", textAlign: "center", fontSize: 13 },
    footerLink: { color: "#e50914", fontWeight: "700" },
});

export default LoginScreen;