import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, KeyboardAvoidingView,
    Platform, ScrollView, StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { register } from "../redux/actions";

const RegisterScreen = ({ navigation }) => {
    const [fullName,  setFullName]  = useState("");
    const [email,     setEmail]     = useState("");
    const [password,  setPassword]  = useState("");
    const [confirm,   setConfirm]   = useState("");
    const [showPass,  setShowPass]  = useState(false);
    const [showConf,  setShowConf]  = useState(false);
    const dispatch    = useDispatch();
    const authLoading = useSelector(s => s.authLoading);
    const authError   = useSelector(s => s.authError);
    const insets      = useSafeAreaInsets();

    const handleRegister = async () => {
        if (!fullName.trim() || !email.trim() || !password || !confirm) {
            Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ tất cả các trường");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Mật khẩu quá ngắn", "Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        if (password !== confirm) {
            Alert.alert("Không khớp", "Mật khẩu xác nhận không trùng với mật khẩu đã nhập");
            return;
        }
        const ok = await dispatch(register(fullName.trim(), email.trim(), password));
        if (ok) {
            Alert.alert(
                "🎉 Đăng ký thành công!",
                "Tài khoản đã được tạo. Hãy đăng nhập để tiếp tục.",
                [{ text: "Đăng nhập ngay", onPress: () => navigation.navigate("Login") }]
            );
        }
    };

    const allFilled = fullName && email && password && confirm;

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
                    {/* ── Logo ── */}
                    <View style={styles.logoWrap}>
                        <View style={styles.logoIcon}>
                            <Text style={styles.logoEmoji}>🎬</Text>
                        </View>
                        <Text style={styles.logoName}>MovieApp</Text>
                        <Text style={styles.logoTagline}>Tạo tài khoản để bắt đầu</Text>
                    </View>

                    {/* ── Form card ── */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Tạo tài khoản</Text>

                        {authError ? (
                            <View style={styles.errorBox}>
                                <Ionicons name="alert-circle-outline" size={16} color="#e50914" />
                                <Text style={styles.errorText}>{authError}</Text>
                            </View>
                        ) : null}

                        {/* Họ và tên */}
                        <View style={styles.inputWrap}>
                            <Ionicons name="person-outline" size={18} color="#555" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Họ và tên"
                                placeholderTextColor="#555"
                                value={fullName}
                                onChangeText={setFullName}
                                returnKeyType="next"
                            />
                        </View>

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
                                placeholder="Mật khẩu (ít nhất 6 ký tự)"
                                placeholderTextColor="#555"
                                secureTextEntry={!showPass}
                                value={password}
                                onChangeText={setPassword}
                                returnKeyType="next"
                            />
                            <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                                <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={18} color="#555" />
                            </TouchableOpacity>
                        </View>

                        {/* Xác nhận mật khẩu */}
                        <View style={[
                            styles.inputWrap,
                            confirm && password !== confirm && styles.inputError,
                        ]}>
                            <Ionicons name="shield-checkmark-outline" size={18} color="#555" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Xác nhận mật khẩu"
                                placeholderTextColor="#555"
                                secureTextEntry={!showConf}
                                value={confirm}
                                onChangeText={setConfirm}
                                returnKeyType="done"
                                onSubmitEditing={handleRegister}
                            />
                            <TouchableOpacity onPress={() => setShowConf(!showConf)} style={styles.eyeBtn}>
                                <Ionicons name={showConf ? "eye-off-outline" : "eye-outline"} size={18} color="#555" />
                            </TouchableOpacity>
                        </View>
                        {confirm && password !== confirm ? (
                            <Text style={styles.matchHint}>⚠ Mật khẩu không khớp</Text>
                        ) : null}

                        {/* Nút đăng ký */}
                        <TouchableOpacity
                            style={[styles.btn, (!allFilled || authLoading) && styles.btnDisabled]}
                            onPress={handleRegister}
                            disabled={!allFilled || authLoading}
                            activeOpacity={0.85}
                        >
                            <View style={styles.btnInner}>
                                <Ionicons name="person-add-outline" size={18} color="#fff" />
                                <Text style={styles.btnText}>
                                    {authLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Phân cách */}
                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>hoặc</Text>
                            <View style={styles.divider} />
                        </View>

                        {/* Về đăng nhập */}
                        <TouchableOpacity
                            style={styles.secondaryBtn}
                            onPress={() => navigation.navigate("Login")}
                        >
                            <Text style={styles.secondaryBtnText}>Đã có tài khoản? Đăng nhập</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.footer}>
                        Đã có tài khoản?{" "}
                        <Text style={styles.footerLink} onPress={() => navigation.navigate("Login")}>
                            Đăng nhập
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

    logoWrap:    { alignItems: "center", marginBottom: 32 },
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

    card: {
        backgroundColor: "#141414",
        borderRadius: 16, padding: 24,
        borderWidth: 1, borderColor: "#222",
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5, shadowRadius: 12,
        elevation: 6,
    },
    cardTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 20, letterSpacing: -0.3 },

    errorBox:  {
        flexDirection: "row", alignItems: "center", gap: 8,
        backgroundColor: "#e509141a",
        borderWidth: 1, borderColor: "#e5091440",
        borderRadius: 8, padding: 10, marginBottom: 16,
    },
    errorText: { color: "#e50914", fontSize: 13, flex: 1 },

    inputWrap: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#1c1c1c",
        borderWidth: 1, borderColor: "#2a2a2a",
        borderRadius: 10, marginBottom: 14,
        paddingHorizontal: 12, height: 52,
    },
    inputError: { borderColor: "#e50914" },
    inputIcon: { marginRight: 10 },
    input:     { flex: 1, color: "#fff", fontSize: 15 },
    eyeBtn:    { padding: 4 },
    matchHint: { color: "#e50914", fontSize: 12, marginTop: -10, marginBottom: 12, marginLeft: 4 },

    btn: {
        backgroundColor: "#e50914",
        height: 52, borderRadius: 10,
        justifyContent: "center", alignItems: "center",
        marginTop: 4,
    },
    btnDisabled: { opacity: 0.45 },
    btnInner:    { flexDirection: "row", alignItems: "center", gap: 8 },
    btnText:     { color: "#fff", fontSize: 16, fontWeight: "800" },

    dividerRow:  { flexDirection: "row", alignItems: "center", marginVertical: 18, gap: 12 },
    divider:     { flex: 1, height: 1, backgroundColor: "#222" },
    dividerText: { color: "#444", fontSize: 13 },

    secondaryBtn: {
        height: 52, borderRadius: 10,
        justifyContent: "center", alignItems: "center",
        borderWidth: 1.5, borderColor: "#333",
    },
    secondaryBtnText: { color: "#b3b3b3", fontSize: 15, fontWeight: "600" },

    footer:     { color: "#555", textAlign: "center", fontSize: 13 },
    footerLink: { color: "#e50914", fontWeight: "700" },
});

export default RegisterScreen;