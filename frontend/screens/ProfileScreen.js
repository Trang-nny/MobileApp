import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, Platform } from "react-native";
import { SafeAreaView }   from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons }       from "@expo/vector-icons";
import { logout }         from "../redux/actions";

const ProfileScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const user     = useSelector(s => s.user);
    const isAdmin  = user?.role === "admin";

    if (!user) {
        return (
            <SafeAreaView style={styles.center}>
                <View style={styles.anonIcon}>
                    <Ionicons name="person-outline" size={40} color="#e50914" />
                </View>
                <Text style={styles.anonTitle}>Chưa đăng nhập</Text>
                <Text style={styles.anonSub}>Đăng nhập để trải nghiệm đầy đủ tính năng</Text>
                <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.loginBtnText}>Đăng nhập</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate("Register")}>
                    <Text style={styles.registerBtnText}>Tạo tài khoản mới</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const initials = user.full_name
        ? user.full_name.split(" ").map(w => w[0]).slice(-2).join("").toUpperCase()
        : "?";

    const handleLogout = () => {
        if (Platform.OS === "web") {
            const confirmLogout = window.confirm("Bạn có chắc muốn đăng xuất?");
            if (confirmLogout) {
                dispatch(logout());
                navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            }
        } else {
            Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
                { text: "Huỷ", style: "cancel" },
                { 
                    text: "Đăng xuất", 
                    style: "destructive", 
                    onPress: () => {
                        dispatch(logout());
                        navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                    } 
                },
            ]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── Cover + Avatar ── */}
                <View style={styles.coverWrap}>
                    <LinearGradient
                        colors={isAdmin ? ["#7a0000", "#e50914"] : ["#e50914", "#7a0000"]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.avatarRing}>
                        {user.avatar ? (
                            <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
                        ) : (
                            <View style={styles.avatarFallback}>
                                <Text style={styles.avatarText}>{initials}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* ── Tên + Email + Badge Admin ── */}
                <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{user.full_name}</Text>
                        {isAdmin && (
                            <View style={styles.adminBadge}>
                                <Ionicons name="shield-checkmark" size={13} color="#e50914" />
                                <Text style={styles.adminBadgeText}>ADMIN</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.email}>{user.email}</Text>
                </View>

                {/* ── Menu Quản trị (chỉ hiện với Admin) ── */}
                {isAdmin && (
                    <View style={styles.menuSection}>
                        <Text style={styles.menuSectionTitle}>Quản trị hệ thống</Text>
                        <MenuItem
                            icon="shield-checkmark"
                            label="Bảng điều khiển Admin"
                            desc="Tổng quan thống kê hệ thống"
                            iconColor="#e50914"
                            onPress={() => navigation.navigate("AdminDashboard")}
                        />
                        <MenuItem
                            icon="film"
                            label="Quản lý Phim"
                            desc="Thêm, sửa, xóa phim"
                            iconColor="#e50914"
                            onPress={() => navigation.navigate("AdminMovies")}
                        />
                        <MenuItem
                            icon="pricetags"
                            label="Quản lý Thể loại"
                            desc="Thêm, sửa, xóa thể loại"
                            iconColor="#10b981"
                            onPress={() => navigation.navigate("AdminGenres")}
                        />
                        <MenuItem
                            icon="people"
                            label="Quản lý Người dùng"
                            desc="Xem và xóa tài khoản"
                            iconColor="#3b82f6"
                            onPress={() => navigation.navigate("AdminUsers")}
                        />
                    </View>
                )}

                {/* ── Menu Tài khoản thường ── */}
                <View style={styles.menuSection}>
                    <Text style={styles.menuSectionTitle}>Tài khoản</Text>
                    <MenuItem
                        icon="heart"
                        label="Phim yêu thích"
                        desc="Danh sách phim đã lưu"
                        onPress={() => navigation.navigate("Favorites")}
                    />
                    <MenuItem
                        icon="time"
                        label="Lịch sử xem"
                        desc="Phim đã xem gần đây"
                        onPress={() => navigation.navigate("History")}
                    />
                    <MenuItem
                        icon="create-outline"
                        label="Chỉnh sửa hồ sơ"
                        desc="Cập nhật thông tin cá nhân"
                        onPress={() => navigation.navigate("EditProfile")}
                    />
                </View>

                {/* ── Đăng xuất ── */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#e50914" />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const MenuItem = ({ icon, label, desc, onPress, iconColor = "#e50914" }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={[styles.menuIconWrap, { backgroundColor: iconColor + "1a" }]}>
            <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.menuTextWrap}>
            <Text style={styles.menuLabel}>{label}</Text>
            {desc ? <Text style={styles.menuDesc}>{desc}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={16} color="#444" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container:       { flex: 1, backgroundColor: "#0a0a0a" },
    center:          { flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center", padding: 32 },

    coverWrap:       { height: 140, justifyContent: "flex-end", paddingBottom: 0, position: "relative" },
    avatarRing:      {
        position: "absolute", bottom: -40, left: 20,
        width: 80, height: 80, borderRadius: 40,
        borderWidth: 3, borderColor: "#0a0a0a",
        backgroundColor: "#1c1c1c",
        overflow: "hidden",
        justifyContent: "center", alignItems: "center",
    },
    avatarImg:       { width: "100%", height: "100%", borderRadius: 40 },
    avatarFallback:  { width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "#1c1c1c" },
    avatarText:      { color: "#e50914", fontSize: 26, fontWeight: "900" },

    userInfo:        { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 24 },
    nameRow:         { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
    name:            { color: "#fff", fontSize: 22, fontWeight: "900", letterSpacing: -0.3 },
    adminBadge:      { flexDirection: "row", alignItems: "center", gap: 4,
                       backgroundColor: "#e509141a", borderRadius: 20,
                       paddingHorizontal: 10, paddingVertical: 4,
                       borderWidth: 1, borderColor: "#e5091433" },
    adminBadgeText:  { color: "#e50914", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
    email:           { color: "#777", fontSize: 13, marginTop: 4 },

    menuSection:     { marginHorizontal: 16, marginBottom: 20 },
    menuSectionTitle:{ color: "#555", fontSize: 11, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10, marginLeft: 4 },
    menuItem:        { flexDirection: "row", alignItems: "center", backgroundColor: "#141414", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8, gap: 12, borderWidth: 1, borderColor: "#1e1e1e" },
    menuIconWrap:    { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    menuTextWrap:    { flex: 1 },
    menuLabel:       { color: "#fff", fontSize: 15, fontWeight: "600" },
    menuDesc:        { color: "#555", fontSize: 12, marginTop: 2 },

    logoutBtn:       { flexDirection: "row", alignItems: "center", justifyContent: "center", marginHorizontal: 16, paddingVertical: 15, borderRadius: 12, backgroundColor: "#141414", gap: 10, borderWidth: 1, borderColor: "#2a2a2a" },
    logoutText:      { color: "#e50914", fontSize: 15, fontWeight: "700" },

    anonIcon:        { width: 80, height: 80, borderRadius: 40, backgroundColor: "#1c1c1c", justifyContent: "center", alignItems: "center", marginBottom: 20 },
    anonTitle:       { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 8 },
    anonSub:         { color: "#6e6e6e", fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 28 },
    loginBtn:        { backgroundColor: "#e50914", borderRadius: 8, paddingHorizontal: 40, paddingVertical: 14, marginBottom: 12, width: "80%" },
    loginBtnText:    { color: "#fff", fontWeight: "bold", fontSize: 15, textAlign: "center" },
    registerBtn:     { backgroundColor: "transparent", borderRadius: 8, paddingHorizontal: 40, paddingVertical: 14, borderWidth: 1, borderColor: "#333", width: "80%" },
    registerBtnText: { color: "#b3b3b3", fontSize: 15, textAlign: "center" },
});

export default ProfileScreen;