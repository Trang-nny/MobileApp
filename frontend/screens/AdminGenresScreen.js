import React, { useEffect, useState } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet, FlatList,
    Alert, ActivityIndicator, TextInput, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons }     from "@expo/vector-icons";
import { useSelector }  from "react-redux";
import { API }          from "../redux/actions";

export default function AdminGenresScreen() {
    const token = useSelector(s => s.token);

    const [genres,  setGenres]  = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [editGenre,    setEditGenre]    = useState(null); // null = thêm mới
    const [inputName,    setInputName]    = useState("");
    const [saving,       setSaving]       = useState(false);

    useEffect(() => { loadGenres(); }, []);

    const loadGenres = async () => {
        setLoading(true);
        try {
            const res  = await fetch(`${API}/genres`);
            setGenres(await res.json());
        } catch {
            Alert.alert("Lỗi", "Không tải được thể loại");
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditGenre(null);
        setInputName("");
        setModalVisible(true);
    };

    const openEdit = (genre) => {
        setEditGenre(genre);
        setInputName(genre.name);
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!inputName.trim()) return Alert.alert("Lỗi", "Tên thể loại không được để trống");
        setSaving(true);
        try {
            const url    = editGenre ? `${API}/admin/genres/${editGenre.id}` : `${API}/admin/genres`;
            const method = editGenre ? "PUT" : "POST";
            const res    = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body:    JSON.stringify({ name: inputName.trim() }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setModalVisible(false);
            loadGenres();
        } catch (e) {
            Alert.alert("Lỗi", e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (genre) => {
        Alert.alert(
            "Xóa thể loại",
            `Xóa thể loại "${genre.name}"? Các phim thuộc thể loại này sẽ mất liên kết.`,
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Xóa", style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await fetch(`${API}/admin/genres/${genre.id}`, {
                                method: "DELETE",
                                headers: { Authorization: `Bearer ${token}` },
                            });
                            if (!res.ok) throw new Error();
                            loadGenres();
                        } catch {
                            Alert.alert("Lỗi", "Không thể xóa thể loại");
                        }
                    },
                },
            ]
        );
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.row}>
            <View style={styles.indexWrap}>
                <Text style={styles.indexText}>{index + 1}</Text>
            </View>
            <Text style={styles.genreName}>{item.name}</Text>
            <View style={styles.actions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                    <Ionicons name="create-outline" size={18} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                    <Ionicons name="trash-outline" size={18} color="#e50914" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={["bottom"]}>
            {/* Nút thêm */}
            <View style={styles.topBar}>
                <Text style={styles.count}>{genres.length} thể loại</Text>
                <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.addBtnText}>Thêm mới</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator color="#e50914" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={genres}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            {/* Modal thêm/sửa */}
            <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
                <View style={modal.overlay}>
                    <View style={modal.box}>
                        <Text style={modal.title}>{editGenre ? "Sửa thể loại" : "Thêm thể loại mới"}</Text>
                        <TextInput
                            style={modal.input}
                            value={inputName}
                            onChangeText={setInputName}
                            placeholder="Tên thể loại..."
                            placeholderTextColor="#444"
                            autoFocus
                        />
                        <View style={modal.btnRow}>
                            <TouchableOpacity style={modal.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={modal.cancelText}>Huỷ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={modal.saveBtn} onPress={handleSave} disabled={saving}>
                                {saving
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={modal.saveText}>Lưu</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container:  { flex: 1, backgroundColor: "#0a0a0a" },
    topBar:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                  paddingHorizontal: 16, paddingVertical: 12 },
    count:      { color: "#777", fontSize: 13 },
    addBtn:     { flexDirection: "row", alignItems: "center", gap: 4,
                  backgroundColor: "#10b981", borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 10 },
    addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

    row:        { flexDirection: "row", alignItems: "center", backgroundColor: "#141414",
                  marginHorizontal: 16, marginBottom: 8, borderRadius: 12,
                  padding: 14, borderWidth: 1, borderColor: "#1e1e1e", gap: 12 },
    indexWrap:  { width: 28, height: 28, borderRadius: 8, backgroundColor: "#1e1e1e",
                  justifyContent: "center", alignItems: "center" },
    indexText:  { color: "#555", fontSize: 12, fontWeight: "700" },
    genreName:  { flex: 1, color: "#fff", fontSize: 15, fontWeight: "600" },
    actions:    { flexDirection: "row", gap: 8 },
    editBtn:    { width: 34, height: 34, borderRadius: 8, backgroundColor: "#1c3a5e",
                  justifyContent: "center", alignItems: "center" },
    deleteBtn:  { width: 34, height: 34, borderRadius: 8, backgroundColor: "#2a0a0a",
                  justifyContent: "center", alignItems: "center" },
});

const modal = StyleSheet.create({
    overlay:    { flex: 1, backgroundColor: "#000000aa", justifyContent: "center",
                  alignItems: "center", padding: 32 },
    box:        { backgroundColor: "#141414", borderRadius: 16, padding: 24,
                  width: "100%", borderWidth: 1, borderColor: "#1e1e1e" },
    title:      { color: "#fff", fontSize: 17, fontWeight: "800", marginBottom: 16 },
    input:      { backgroundColor: "#0a0a0a", color: "#fff", borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 12,
                  borderWidth: 1, borderColor: "#2a2a2a", fontSize: 15, marginBottom: 20 },
    btnRow:     { flexDirection: "row", gap: 10 },
    cancelBtn:  { flex: 1, paddingVertical: 12, borderRadius: 10,
                  backgroundColor: "#1e1e1e", alignItems: "center" },
    cancelText: { color: "#888", fontWeight: "700" },
    saveBtn:    { flex: 1, paddingVertical: 12, borderRadius: 10,
                  backgroundColor: "#10b981", alignItems: "center" },
    saveText:   { color: "#fff", fontWeight: "700" },
});