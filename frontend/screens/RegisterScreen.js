import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../redux/actions";

const RegisterScreen = ({ navigation }) => {
    const [fullName,  setFullName]  = useState("");
    const [email,     setEmail]     = useState("");
    const [password,  setPassword]  = useState("");
    const [confirm,   setConfirm]   = useState("");
    const dispatch    = useDispatch();
    const authLoading = useSelector(s => s.authLoading);
    const authError   = useSelector(s => s.authError);

    const handleRegister = async () => {
        if (!fullName || !email || !password || !confirm) { Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin"); return; }
        if (password.length < 6) { Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự"); return; }
        if (password !== confirm) { Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp"); return; }
        const ok = await dispatch(register(fullName, email, password));
        if (ok) Alert.alert("Thành công", "Đăng ký thành công!", [{ text: "OK", onPress: () => navigation.navigate("Login") }]);
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <Text style={styles.title}>Tạo tài khoản</Text>
            {authError ? <Text style={styles.error}>{authError}</Text> : null}
            <TextInput style={styles.input} placeholder="Họ và tên"            placeholderTextColor="#555" value={fullName}  onChangeText={setFullName} />
            <TextInput style={styles.input} placeholder="Email"                placeholderTextColor="#555" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <TextInput style={styles.input} placeholder="Mật khẩu (≥ 6 ký tự)" placeholderTextColor="#555" secureTextEntry value={password} onChangeText={setPassword} />
            <TextInput style={styles.input} placeholder="Xác nhận mật khẩu"    placeholderTextColor="#555" secureTextEntry value={confirm}  onChangeText={setConfirm} />
            <TouchableOpacity style={[styles.btn, authLoading && { opacity: 0.6 }]} onPress={handleRegister} disabled={authLoading}>
                <Text style={styles.btnText}>{authLoading ? "Đang xử lý..." : "Đăng ký"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.link}>Đã có tài khoản? <Text style={styles.linkRed}>Đăng nhập</Text></Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", paddingHorizontal: 28 },
    title:     { fontSize: 26, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 28 },
    error:     { color: "#e50914", textAlign: "center", marginBottom: 12, fontSize: 13 },
    input:     { backgroundColor: "#1c1c1c", color: "#fff", borderWidth: 1, borderColor: "#2a2a2a", borderRadius: 8, paddingHorizontal: 14, height: 48, fontSize: 15, marginBottom: 14 },
    btn:       { backgroundColor: "#e50914", height: 50, borderRadius: 8, justifyContent: "center", alignItems: "center", marginTop: 6, marginBottom: 20 },
    btnText:   { color: "#fff", fontSize: 16, fontWeight: "bold" },
    link:      { color: "#b3b3b3", textAlign: "center", fontSize: 14 },
    linkRed:   { color: "#e50914", fontWeight: "bold" },
});

export default RegisterScreen;