import React, { useEffect, useState } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet, FlatList,
    Alert, ActivityIndicator, TextInput, Modal, ScrollView, Image, Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons }     from "@expo/vector-icons";
import { useSelector, useDispatch }  from "react-redux";
import { 
    fetchAdminMovies, fetchAdminGenres, 
    addAdminMovie, updateAdminMovie, deleteAdminMovie 
} from "../redux/actions";

const TMDB = "https://image.tmdb.org";

function normPoster(url) {
    if (!url) return null;
    url = String(url).trim();
    if (url.startsWith("http://") || url.startsWith("https://"))
        return url.replace(/\/t\/p\/(w\d+|original)\//, "/t/p/w500/");
    if (url.startsWith("/t/p/")) return TMDB + url.replace(/\/t\/p\/(w\d+|original)\//, "/t/p/w500/");
    if (url.startsWith("/"))    return `${TMDB}/t/p/w500${url}`;
    return `${TMDB}/t/p/w500/${url}`;
}

function resolveImg(movie) {
    if (!movie) return null;
    const p = normPoster(movie.poster_url);
    if (p) return { uri: p };
    return null;
}

const MovieFormModal = ({ visible, movie, genres, token, onClose }) => {
    const dispatch = useDispatch();
    const isEdit = !!movie;

    const [title,       setTitle]       = useState("");
    const [description, setDescription] = useState("");
    const [year,        setYear]        = useState("");
    const [rating,      setRating]      = useState("");
    const [posterUrl,   setPosterUrl]   = useState("");
    const [trailerUrl,  setTrailerUrl]  = useState("");
    const [director,    setDirector]    = useState("");
    const [castList,    setCastList]    = useState("");
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [saving, setSaving]           = useState(false);

    useEffect(() => {
        if (movie) {
            setTitle(movie.title       || "");
            setDescription(movie.description || "");
            setYear(String(movie.year  || ""));
            setRating(String(movie.rating || ""));
            setPosterUrl(movie.poster_url  || "");
            setTrailerUrl(movie.trailer_url || "");
            setDirector(movie.director || "");
            setCastList(movie.cast_list || "");
            if (movie.genres && genres.length > 0) {
                const ids = genres
                    .filter(g => movie.genres.includes(g.name))
                    .map(g => g.id);
                setSelectedGenres(ids);
            }
        } else {
            setTitle(""); setDescription(""); setYear(""); setRating("");
            setPosterUrl(""); setTrailerUrl(""); setDirector(""); setCastList("");
            setSelectedGenres([]);
        }
    }, [movie, visible]);

    const toggleGenre = (id) => {
        setSelectedGenres(prev =>
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    const handleSave = async () => {
        if (!title.trim()) return Alert.alert("Lỗi", "Tiêu đề không được để trống");
        if (!year.trim())  return Alert.alert("Lỗi", "Năm phát hành không được để trống");

        setSaving(true);
        try {
            const body = {
                title, description, year: parseInt(year), rating: parseFloat(rating) || 0,
                poster_url: posterUrl, trailer_url: trailerUrl,
                director, cast_list: castList, genre_ids: selectedGenres,
            };

            if (isEdit) {
                await dispatch(updateAdminMovie(movie.id, body, token));
            } else {
                await dispatch(addAdminMovie(body, token));
            }

            Alert.alert("Thành công", isEdit ? "Đã cập nhật phim" : "Đã thêm phim mới");
            onClose();
        } catch (e) {
            Alert.alert("Lỗi", e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <SafeAreaView style={modal.container}>
                <View style={modal.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={modal.title}>{isEdit ? "Sửa phim" : "Thêm phim mới"}</Text>
                    <TouchableOpacity onPress={handleSave} disabled={saving}>
                        {saving ? <ActivityIndicator color="#e50914" /> : <Text style={modal.saveBtn}>Lưu</Text>}
                    </TouchableOpacity>
                </View>

                <ScrollView style={modal.body} showsVerticalScrollIndicator={false}>
                    <Field label="Tiêu đề *"         value={title}       onChange={setTitle} />
                    <Field label="Mô tả"              value={description} onChange={setDescription} multiline />
                    <Field label="Năm phát hành *"    value={year}        onChange={setYear}    keyboardType="numeric" />
                    <Field label="Rating (0-10)"       value={rating}      onChange={setRating}  keyboardType="decimal-pad" />
                    <Field label="URL Poster"          value={posterUrl}   onChange={setPosterUrl} />
                    <Field label="URL Trailer (YouTube embed)" value={trailerUrl} onChange={setTrailerUrl} />
                    <Field label="Đạo diễn"           value={director}    onChange={setDirector} />
                    <Field label="Diễn viên"          value={castList}    onChange={setCastList} />

                    <Text style={modal.fieldLabel}>Thể loại</Text>
                    <View style={modal.genreWrap}>
                        {genres.map(g => (
                            <TouchableOpacity
                                key={g.id}
                                style={[modal.genreTag, selectedGenres.includes(g.id) && modal.genreTagActive]}
                                onPress={() => toggleGenre(g.id)}
                            >
                                <Text style={[modal.genreTagText, selectedGenres.includes(g.id) && modal.genreTagTextActive]}>
                                    {g.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const Field = ({ label, value, onChange, multiline, keyboardType }) => (
    <View style={modal.fieldWrap}>
        <Text style={modal.fieldLabel}>{label}</Text>
        <TextInput
            style={[modal.input, multiline && { height: 80, textAlignVertical: "top" }]}
            value={value}
            onChangeText={onChange}
            multiline={multiline}
            keyboardType={keyboardType || "default"}
            placeholderTextColor="#444"
            placeholder="Nhập..."
        />
    </View>
);

export default function AdminMoviesScreen() {
    const token = useSelector(s => s.token);
    const movies = useSelector(s => s.adminMovies);
    const genres = useSelector(s => s.adminGenres);
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [search,  setSearch]  = useState("");
    const [formVisible,    setFormVisible]    = useState(false);
    const [editingMovie,   setEditingMovie]   = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await Promise.all([
                dispatch(fetchAdminMovies()),
                dispatch(fetchAdminGenres())
            ]);
            setLoading(false);
        };
        loadInitialData();
    }, []);

    const handleDelete = (movie) => {
        const message = `Bạn có chắc muốn xóa "${movie.title}"?\nThao tác này không thể hoàn tác.`;
        if (Platform.OS === "web") {
            if (window.confirm(message)) executeDelete(movie);
        } else {
            Alert.alert("Xóa phim", message, [
                { text: "Huỷ", style: "cancel" },
                { text: "Xóa", style: "destructive", onPress: () => executeDelete(movie) },
            ]);
        }
    };

    const executeDelete = async (movie) => {
        try {
            await dispatch(deleteAdminMovie(movie.id, token));
            Alert.alert("Đã xóa", `"${movie.title}" đã được xóa`);
        } catch {
            Alert.alert("Lỗi", "Không thể xóa phim");
        }
    };

    const filtered = movies.filter(m => m.title?.toLowerCase().includes(search.toLowerCase()));

    const renderMovie = ({ item }) => {
        const imgSrc = resolveImg(item);
        return (
            <View style={styles.row}>
                {imgSrc ? (
                    <Image source={imgSrc} style={styles.poster} />
                ) : (
                    <View style={[styles.poster, styles.posterFallback]}>
                        <Ionicons name="film-outline" size={20} color="#333" />
                    </View>
                )}
                <View style={styles.info}>
                    <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.movieMeta}>{item.year}  ·  ⭐ {item.rating}</Text>
                    <Text style={styles.movieGenres} numberOfLines={1}>
                        {Array.isArray(item.genres) ? item.genres.join(", ") : ""}
                    </Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.editBtn} onPress={() => { setEditingMovie(item); setFormVisible(true); }}>
                        <Ionicons name="create-outline" size={18} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                        <Ionicons name="trash-outline" size={18} color="#e50914" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={["bottom"]}>
            <View style={styles.topBar}>
                <View style={styles.searchWrap}>
                    <Ionicons name="search" size={16} color="#555" />
                    <TextInput style={styles.searchInput} placeholder="Tìm phim..." placeholderTextColor="#555" value={search} onChangeText={setSearch} />
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={() => { setEditingMovie(null); setFormVisible(true); }}>
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.addBtnText}>Thêm</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator color="#e50914" style={{ marginTop: 40 }} />
            ) : (
                <FlatList data={filtered} keyExtractor={item => String(item.id)} renderItem={renderMovie} contentContainerStyle={{ paddingBottom: 20 }} ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy phim nào</Text>} />
            )}

            <MovieFormModal visible={formVisible} movie={editingMovie} genres={genres} token={token} onClose={() => setFormVisible(false)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container:    { flex: 1, backgroundColor: "#0a0a0a" },
    topBar:       { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
    searchWrap:   { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#141414", borderRadius: 10, paddingHorizontal: 12, height: 42, borderWidth: 1, borderColor: "#1e1e1e" },
    searchInput:  { flex: 1, color: "#fff", fontSize: 14, height: "100%", paddingVertical: 0 },
    addBtn:       { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: "#e50914", borderRadius: 10, paddingHorizontal: 14, height: 42 },
    addBtnText:   { color: "#fff", fontWeight: "700", fontSize: 14 },
    row:          { flexDirection: "row", alignItems: "center", backgroundColor: "#141414", marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#1e1e1e", gap: 10 },
    poster:       { width: 46, height: 66, borderRadius: 6, backgroundColor: "#1c1c1c" },
    posterFallback: { justifyContent: "center", alignItems: "center" },
    info:         { flex: 1, gap: 3 },
    movieTitle:   { color: "#fff", fontWeight: "700", fontSize: 14 },
    movieMeta:    { color: "#777", fontSize: 12 },
    movieGenres:  { color: "#e50914", fontSize: 11 },
    actions:      { gap: 6 },
    editBtn:      { width: 34, height: 34, borderRadius: 8, backgroundColor: "#1c3a5e", justifyContent: "center", alignItems: "center" },
    deleteBtn:    { width: 34, height: 34, borderRadius: 8, backgroundColor: "#2a0a0a", justifyContent: "center", alignItems: "center" },
    empty:        { color: "#555", textAlign: "center", marginTop: 40 },
});

const modal = StyleSheet.create({
    container:        { flex: 1, backgroundColor: "#0a0a0a" },
    header:           { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderColor: "#1e1e1e" },
    title:            { color: "#fff", fontSize: 17, fontWeight: "800" },
    saveBtn:          { color: "#e50914", fontWeight: "800", fontSize: 16 },
    body:             { padding: 20 },
    fieldWrap:        { marginBottom: 16 },
    fieldLabel:       { color: "#888", fontSize: 12, marginBottom: 6, fontWeight: "600" },
    input:            { backgroundColor: "#141414", color: "#fff", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "#1e1e1e", fontSize: 14 },
    genreWrap:        { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    genreTag:         { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#141414", borderWidth: 1, borderColor: "#2a2a2a" },
    genreTagActive:   { backgroundColor: "#e509141a", borderColor: "#e50914" },
    genreTagText:     { color: "#777", fontSize: 13 },
    genreTagTextActive: { color: "#e50914", fontWeight: "700" },
});