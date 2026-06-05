import React, { useEffect, useState } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet, FlatList,
    Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons }     from "@expo/vector-icons";
import { useSelector }  from "react-redux";
import { API }          from "../redux/actions";

export default function AdminUsersScreen() {
    const token   = useSelector(s => s.token);
    const myId    = useSelector(s => s.user?.id);

    const [users,   setUsers]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(await res.json());
        } catch {
            Alert.alert("Lỗi", "Không tải được danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (user) => {
        if (user.id === myId) {
            return Alert.alert("Không thể xóa", "Bạn không thể xóa tài khoản của chính mình");
        }
        Alert.alert(
            "Xóa người dùng",
            `Xóa tài khoản "${user.full_name}"?\nThao tác này không thể hoàn tác.`,
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Xóa", style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await fetch(`${API}/admin/users/${user.id}`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            if (!res.ok) throw new Error();
                            loadUsers();
                        } catch {
                            Alert.alert("Lỗi", "Không thể xóa người dùng");
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    };

    const renderItem = ({ item }) => {
        const isMe    = item.id === myId;
        const isAdmin = item.role === "admin";
        const initials = item.full_name
            ? item.full_name.split(" ").map(w => w[0]).slice(-2).join("").toUpperCase()
            : "?";

        return (
            <View style={styles.row}>
                {/* Avatar chữ cái */}
                <View style={[styles.avatar, isAdmin && styles.avatarAdmin]}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>

                {/* Thông tin */}
                <View style={styles.info}>
                    <View style={styles.nameRow}>
                        <Text style={styles.name} numberOfLines={1}>{item.full_name}</Text>
                        {isAdmin && (
                            <View style={styles.adminBadge}>
                                <Ionicons name="shield-checkmark" size={10} color="#e50914" />
                                <Text style={styles.adminBadgeText}>Admin</Text>
                            </View>
                        )}
                        {isMe && <Text style={styles.meTag}>(Bạn)</Text>}
                    </View>
                    <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
                    <Text style={styles.date}>Tham gia: {formatDate(item.created_at)}</Text>
                </View>

                {/* Nút xóa (ẩn với admin và chính mình) */}
                {!isAdmin && !isMe && (
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                        <Ionicons name="trash-outline" size={18} color="#e50914" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const adminCount = users.filter(u => u.role === "admin").length;
    const userCount  = users.filter(u => u.role === "user").length;

    return (
        <SafeAreaView style={styles.container}>
            {/* Summary */}
            <View style={styles.summary}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryNum}>{users.length}</Text>
                    <Text style={styles.summaryLabel}>Tổng tài khoản</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNum, { color: "#e50914" }]}>{adminCount}</Text>
                    <Text style={styles.summaryLabel}>Admin</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                    <Text style={[styles.summaryNum, { color: "#3b82f6" }]}>{userCount}</Text>
                    <Text style={styles.summaryLabel}>Người dùng</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator color="#e50914" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <Text style={styles.empty}>Không có người dùng nào</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container:       { flex: 1, backgroundColor: "#0a0a0a" },

    summary:         { flexDirection: "row", backgroundColor: "#141414",
                       marginHorizontal: 16, marginVertical: 12, borderRadius: 12,
                       padding: 16, borderWidth: 1, borderColor: "#1e1e1e" },
    summaryItem:     { flex: 1, alignItems: "center" },
    summaryNum:      { color: "#fff", fontSize: 22, fontWeight: "900" },
    summaryLabel:    { color: "#666", fontSize: 11, marginTop: 2 },
    divider:         { width: 1, backgroundColor: "#1e1e1e", marginHorizontal: 8 },

    row:             { flexDirection: "row", alignItems: "center", backgroundColor: "#141414",
                       marginHorizontal: 16, marginBottom: 8, borderRadius: 12,
                       padding: 12, borderWidth: 1, borderColor: "#1e1e1e", gap: 12 },
    avatar:          { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1c3a5e",
                       justifyContent: "center", alignItems: "center" },
    avatarAdmin:     { backgroundColor: "#2a0a0a" },
    avatarText:      { color: "#fff", fontWeight: "900", fontSize: 15 },
    info:            { flex: 1 },
    nameRow:         { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
    name:            { color: "#fff", fontWeight: "700", fontSize: 14 },
    adminBadge:      { flexDirection: "row", alignItems: "center", gap: 3,
                       backgroundColor: "#e509141a", borderRadius: 10,
                       paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: "#e5091433" },
    adminBadgeText:  { color: "#e50914", fontSize: 9, fontWeight: "800" },
    meTag:           { color: "#555", fontSize: 12 },
    email:           { color: "#777", fontSize: 12, marginTop: 2 },
    date:            { color: "#444", fontSize: 11, marginTop: 2 },
    deleteBtn:       { width: 34, height: 34, borderRadius: 8, backgroundColor: "#2a0a0a",
                       justifyContent: "center", alignItems: "center" },
    empty:           { color: "#555", textAlign: "center", marginTop: 40 },
});