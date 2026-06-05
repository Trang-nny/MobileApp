import React, { useEffect, useState } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons }     from "@expo/vector-icons";
import { useSelector }  from "react-redux";
import { API }          from "../redux/actions";

// ── Card thống kê nhỏ ──────────────────────────────────────
const StatCard = ({ icon, label, value, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
        <Ionicons name={icon} size={26} color={color} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

// ── Nút menu điều hướng ────────────────────────────────────
const NavButton = ({ icon, title, desc, onPress, color = "#e50914" }) => (
    <TouchableOpacity style={styles.navBtn} onPress={onPress} activeOpacity={0.75}>
        <View style={[styles.navIcon, { backgroundColor: color + "22" }]}>
            <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.navText}>
            <Text style={styles.navTitle}>{title}</Text>
            <Text style={styles.navDesc}>{desc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#444" />
    </TouchableOpacity>
);

export default function AdminDashboardScreen({ navigation }) {
    const token = useSelector(s => s.token);
    const user  = useSelector(s => s.user);

    const [stats, setStats]       = useState({ movies: 0, users: 0, genres: 0 });
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [moviesRes, usersRes, genresRes] = await Promise.all([
                fetch(`${API}/movies?limit=1000`, { headers }),
                fetch(`${API}/admin/users`,        { headers }),
                fetch(`${API}/genres`,             { headers }),
            ]);
            const movies  = await moviesRes.json();
            const users   = await usersRes.json();
            const genres  = await genresRes.json();
            setStats({
                movies: Array.isArray(movies) ? movies.length : 0,
                users:  Array.isArray(users)  ? users.length  : 0,
                genres: Array.isArray(genres) ? genres.length : 0,
            });
        } catch (e) {
            Alert.alert("Lỗi", "Không tải được thống kê");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── Header ── */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Xin chào, Admin 👋</Text>
                        <Text style={styles.subGreet}>{user?.full_name}</Text>
                    </View>
                    <View style={styles.badge}>
                        <Ionicons name="shield-checkmark" size={16} color="#e50914" />
                        <Text style={styles.badgeText}>ADMIN</Text>
                    </View>
                </View>

                {/* ── Thống kê ── */}
                <Text style={styles.sectionTitle}>Tổng quan hệ thống</Text>
                {loading ? (
                    <ActivityIndicator color="#e50914" style={{ marginVertical: 20 }} />
                ) : (
                    <View style={styles.statsRow}>
                        <StatCard icon="film-outline"   label="Phim"         value={stats.movies} color="#e50914" />
                        <StatCard icon="people-outline" label="Người dùng"   value={stats.users}  color="#3b82f6" />
                        <StatCard icon="pricetag-outline" label="Thể loại"   value={stats.genres} color="#10b981" />
                    </View>
                )}

                {/* ── Điều hướng ── */}
                <Text style={styles.sectionTitle}>Quản lý nội dung</Text>
                <View style={styles.navSection}>
                    <NavButton
                        icon="film"
                        title="Quản lý Phim"
                        desc="Thêm, sửa, xóa phim trong hệ thống"
                        color="#e50914"
                        onPress={() => navigation.navigate("AdminMovies")}
                    />
                    <NavButton
                        icon="pricetags"
                        title="Quản lý Thể loại"
                        desc="Thêm, sửa, xóa thể loại phim"
                        color="#10b981"
                        onPress={() => navigation.navigate("AdminGenres")}
                    />
                    <NavButton
                        icon="people"
                        title="Quản lý Người dùng"
                        desc="Xem và xóa tài khoản người dùng"
                        color="#3b82f6"
                        onPress={() => navigation.navigate("AdminUsers")}
                    />
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container:    { flex: 1, backgroundColor: "#0a0a0a" },

    header:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
    greeting:     { color: "#fff", fontSize: 22, fontWeight: "900" },
    subGreet:     { color: "#777", fontSize: 13, marginTop: 2 },
    badge:        { flexDirection: "row", alignItems: "center", gap: 5,
                    backgroundColor: "#e509141a", borderRadius: 20,
                    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#e5091433" },
    badgeText:    { color: "#e50914", fontSize: 11, fontWeight: "800", letterSpacing: 1 },

    sectionTitle: { color: "#555", fontSize: 11, fontWeight: "700", letterSpacing: 1.2,
                    textTransform: "uppercase", marginHorizontal: 20, marginBottom: 12, marginTop: 8 },

    statsRow:     { flexDirection: "row", marginHorizontal: 16, gap: 10, marginBottom: 24 },
    statCard:     { flex: 1, backgroundColor: "#141414", borderRadius: 12, padding: 14,
                    alignItems: "center", gap: 6, borderLeftWidth: 3,
                    borderWidth: 1, borderColor: "#1e1e1e" },
    statValue:    { color: "#fff", fontSize: 22, fontWeight: "900" },
    statLabel:    { color: "#666", fontSize: 11, textAlign: "center" },

    navSection:   { marginHorizontal: 16, gap: 8 },
    navBtn:       { flexDirection: "row", alignItems: "center", backgroundColor: "#141414",
                    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
                    gap: 12, borderWidth: 1, borderColor: "#1e1e1e" },
    navIcon:      { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
    navText:      { flex: 1 },
    navTitle:     { color: "#fff", fontSize: 15, fontWeight: "700" },
    navDesc:      { color: "#555", fontSize: 12, marginTop: 2 },
});