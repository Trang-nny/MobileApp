import React, { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ScrollView,
    KeyboardAvoidingView, Platform, Image
} from "react-native";
import { SafeAreaView }       from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons }            from "@expo/vector-icons";
import { updateProfile }       from "../redux/actions";

const EditProfileScreen = ({ navigation }) => {
    const dispatch    = useDispatch();
    const token       = useSelector(s => s.token);
    const user        = useSelector(s => s.user);
    const authLoading = useSelector(s => s.authLoading);

    const [fullName,        setFullName]        = useState(user?.full_name || "");
    const [avatar,          setAvatar]          = useState(user?.avatar    || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword,     setNewPassword]     = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassSection, setShowPassSection] = useState(false);

    const initials = fullName
        ? fullName.split(" ").map(w => w[0]).slice(-2).join("").toUpperCase()
        : "?";

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert("Lỗi", "Họ tên không được để trống");
            return;
        }

        const payload = {
            full_name: fullName.trim(),
            avatar:    avatar.trim() || null,
        };

        // Nếu muốn đổi mật khẩu
        if (showPassSection) {
            if (!currentPassword) {
                Alert.alert("Lỗi", "Vui lòng nhập mật khẩu hiện tại");
                return;
            }
            if (newPassword.length < 6) {
                Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự");
                return;
            }
            if (newPassword !== confirmPassword) {
                Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
                return;
            }
            payload.current_password = currentPassword;
            payload.new_password     = newPassword;
        }

        const result = await dispatch(updateProfile(payload, token));
        if (result.success) {
            Alert.alert("Thành công", "Cập nhật hồ sơ thành công!", [
                { text: "OK", onPress: () => navigation.goBack() }
            ]);
        } else {
            Alert.alert("Lỗi", result.message || "Cập nhật thất bại");
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1, backgroundColor: "#0a0a0a" }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Avatar preview */}
                <View style={styles.avatarSection}>
                    {avatar ? (
                        <Image source={{ uri: avatar }} style={styles.avatarImg} />
                    ) : (
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </View>
                    )}
                    <Text style={styles.avatarHint}>Nhập URL ảnh bên dưới để thay đổi</Text>
                </View>

                {/* Form */}
                <Text style={styles.label}>Họ và tên</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập họ và tên"
                    placeholderTextColor="#555"
                    value={fullName}
                    onChangeText={setFullName}
                />

                <Text style={styles.label}>URL ảnh đại diện</Text>
                <TextInput
                    style={styles.input}
                    placeholder="https://example.com/avatar.jpg"
                    placeholderTextColor="#555"
                    autoCapitalize="none"
                    value={avatar}
                    onChangeText={setAvatar}
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value={user?.email || ""}
                    editable={false}
                />

                {/* Đổi mật khẩu toggle */}
                <TouchableOpacity
                    style={styles.toggleBtn}
                    onPress={() => setShowPassSection(!showPassSection)}
                >
                    <Ionicons
                        name={showPassSection ? "chevron-up-outline" : "chevron-down-outline"}
                        size={16}
                        color="#e50914"
                    />
                    <Text style={styles.toggleText}>
                        {showPassSection ? "Ẩn đổi mật khẩu" : "Đổi mật khẩu"}
                    </Text>
                </TouchableOpacity>

                {showPassSection && (
                    <View style={styles.passSection}>
                        <Text style={styles.label}>Mật khẩu hiện tại</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập mật khẩu hiện tại"
                            placeholderTextColor="#555"
                            secureTextEntry
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />
                        <Text style={styles.label}>Mật khẩu mới</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Tối thiểu 6 ký tự"
                            placeholderTextColor="#555"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập lại mật khẩu mới"
                            placeholderTextColor="#555"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.saveBtn, authLoading && { opacity: 0.6 }]}
                    onPress={handleSave}
                    disabled={authLoading}
                >
                    <Ionicons name="checkmark-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.saveBtnText}>
                        {authLoading ? "Đang lưu..." : "Lưu thay đổi"}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    scroll: {
        padding: 24,
        paddingBottom: 48,
    },
    avatarSection: {
        alignItems: "center",
        marginBottom: 28,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: "#e50914",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    avatarImg: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 8,
        backgroundColor: "#1c1c1c",
    },
    avatarText: {
        color: "#fff",
        fontSize: 32,
        fontWeight: "bold",
    },
    avatarHint: {
        color: "#555",
        fontSize: 12,
    },
    label: {
        color: "#b3b3b3",
        fontSize: 13,
        marginBottom: 6,
        marginTop: 4,
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
    inputDisabled: {
        color: "#555",
    },
    toggleBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 12,
        marginTop: 4,
    },
    toggleText: {
        color: "#e50914",
        fontSize: 14,
        fontWeight: "bold",
    },
    passSection: {
        borderTopWidth: 1,
        borderColor: "#2a2a2a",
        paddingTop: 12,
        marginBottom: 8,
    },
    saveBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#e50914",
        height: 50,
        borderRadius: 8,
        marginTop: 16,
    },
    saveBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default EditProfileScreen;