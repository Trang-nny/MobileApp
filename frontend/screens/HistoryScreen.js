import React, { useEffect, useCallback } from "react";
import {
    View, Text, FlatList, StyleSheet,
    TouchableOpacity, Alert, Image
} from "react-native";
import { SafeAreaView }       from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons }            from "@expo/vector-icons";
import { fetchHistory, removeHistory } from "../redux/actions";
import LoadingSpinner from "../components/LoadingSpinner";

// Map ảnh local — giống MovieCard.js
const ASSETS_MAP = {
    "Avengers: Endgame":       require("../assets/Avenger-Endgame.jpg"),
    "Spider-Man: No Way Home": require("../assets/Spiderman_No_Way_Home.jpg"),
    "Titanic":                 require("../assets/Titanic.jpg"),
    "Zootopia":                require("../assets/Zootopia.jpg"),
    "Paddington in Peru":      require("../assets/Paddington-Peru.jpg"),
};

// Chuẩn hoá URL TMDB về w500
function normalizePosterUrl(url) {
    if (!url) return null;
    return url.replace(/\/t\/p\/(w\d+|original)\//, "/t/p/w500/");
}

function resolveSource(item) {
    if (ASSETS_MAP[item.title]) return ASSETS_MAP[item.title];
    const normalized = normalizePosterUrl(item.poster_url);
    if (normalized) return { uri: normalized };
    return null;
}

function formatTime(seconds) {
    if (!seconds) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}

// ─── HistoryItem ────────────────────────────────────────────────────────────

const HistoryItem = ({ item, onPress, onDelete }) => {
    const source = resolveSource(item);
    const progressPct = Math.min(
        ((item.progress_seconds || 0) / (item.duration_seconds || 7200)) * 100,
        100
    );

    return (
        <View style={item_s.wrapper}>
            {/* Hàng trên: ảnh + info + nút xóa */}
            <View style={item_s.row}>
                {/* Vùng bấm xem phim */}
                <TouchableOpacity style={item_s.cardTouch} onPress={onPress} activeOpacity={0.8}>
                    {source ? (
                        <Image
                            source={source}
                            style={item_s.imgWrap}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[item_s.imgWrap, item_s.imgFallback]}>
                            <Ionicons name="film-outline" size={28} color="#333" />
                        </View>
                    )}
                    <View style={item_s.info}>
                        <Text style={item_s.title} numberOfLines={2}>{item.title}</Text>
                        <Text style={item_s.genre} numberOfLines={1}>
                            {item.genres ? item.genres.join(", ") : item.genre}
                        </Text>
                        <View style={item_s.meta}>
                            <Text style={item_s.metaText}>📅 {item.year}</Text>
                            {item.rating ? <Text style={item_s.metaText}>⭐ {item.rating}</Text> : null}
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Nút xóa — TouchableOpacity riêng, NGOÀI card touch */}
                <TouchableOpacity
                    style={item_s.deleteBtn}
                    onPress={onDelete}
                    activeOpacity={0.6}
                >
                    <Ionicons name="trash-outline" size={22} color="#e50914" />
                </TouchableOpacity>
            </View>

            {/* Thanh tiến trình */}
            <View style={item_s.progressWrap}>
                <View style={item_s.progressBar}>
                    <View style={[item_s.progressFill, { width: `${progressPct}%` }]} />
                </View>
                <Text style={item_s.progressText}>Đã xem: {formatTime(item.progress_seconds)}</Text>
            </View>
        </View>
    );
};

const item_s = StyleSheet.create({
    wrapper:      { marginBottom: 14 },
    row:          { flexDirection: "row", alignItems: "stretch", backgroundColor: "#1c1c1c", borderRadius: 8, borderWidth: 1, borderColor: "#2a2a2a", overflow: "hidden" },
    cardTouch:    { flex: 1, flexDirection: "row" },
    imgWrap:      { width: 90, height: 120 },
    imgFallback:  { backgroundColor: "#111", justifyContent: "center", alignItems: "center" },
    info:         { flex: 1, padding: 12, justifyContent: "center" },
    title:        { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 4 },
    genre:        { fontSize: 12, color: "#b3b3b3", marginBottom: 8 },
    meta:         { flexDirection: "row", gap: 12 },
    metaText:     { fontSize: 12, color: "#b3b3b3" },
    deleteBtn:    { width: 48, justifyContent: "center", alignItems: "center", backgroundColor: "#1c1c1c", borderLeftWidth: 1, borderColor: "#2a2a2a" },
    progressWrap: { paddingHorizontal: 4, marginTop: 6 },
    progressBar:  { height: 3, backgroundColor: "#2a2a2a", borderRadius: 2, marginBottom: 4 },
    progressFill: { height: 3, backgroundColor: "#e50914", borderRadius: 2 },
    progressText: { color: "#555", fontSize: 11 },
});

// ─── HistoryScreen ───────────────────────────────────────────────────────────

const HistoryScreen = ({ navigation }) => {
    const dispatch       = useDispatch();
    const token          = useSelector(s => s.token);
    const history        = useSelector(s => s.history);
    const historyLoading = useSelector(s => s.historyLoading);

    const load = useCallback(() => {
        if (token) dispatch(fetchHistory(token));
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = (item) => {
        const movieId = item.movie_id ?? item.id;
        Alert.alert(
            "Xoá khỏi lịch sử",
            `Xoá "${item.title}" khỏi lịch sử xem?`,
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Xoá",
                    style: "destructive",
                    onPress: () => dispatch(removeHistory(movieId, token)),
                },
            ]
        );
    };

    if (!token) {
        return (
            <SafeAreaView style={styles.center}>
                <Ionicons name="time-outline" size={60} color="#2a2a2a" />
                <Text style={styles.emptyTitle}>Chưa đăng nhập</Text>
                <Text style={styles.emptyText}>Đăng nhập để xem lịch sử phim đã xem</Text>
                <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (historyLoading) return <LoadingSpinner />;

    if (history.length === 0) {
        return (
            <SafeAreaView style={styles.center}>
                <Ionicons name="film-outline" size={60} color="#2a2a2a" />
                <Text style={styles.emptyTitle}>Chưa có lịch sử</Text>
                <Text style={styles.emptyText}>Các phim bạn đã xem sẽ xuất hiện ở đây</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Lịch sử xem ({history.length})</Text>
            <FlatList
                data={history}
                keyExtractor={(item, index) => String(item.movie_id ?? item.id ?? index)}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <HistoryItem
                        item={item}
                        onPress={() => navigation.navigate("VideoPlayer", {
                            movie: item,
                            startAt: item.progress_seconds,
                        })}
                        onDelete={() => handleDelete(item)}
                    />
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container:    { flex: 1, backgroundColor: "#0a0a0a" },
    center:       { flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center", padding: 32 },
    heading:      { color: "#fff", fontSize: 18, fontWeight: "bold", padding: 16, paddingBottom: 8 },
    list:         { paddingHorizontal: 16, paddingBottom: 24 },
    emptyTitle:   { color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 16 },
    emptyText:    { color: "#6e6e6e", fontSize: 14, textAlign: "center", marginTop: 8 },
    loginBtn:     { marginTop: 20, backgroundColor: "#e50914", borderRadius: 8, paddingHorizontal: 28, paddingVertical: 12 },
    loginBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
});

export default HistoryScreen;