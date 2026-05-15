import React, { useEffect, useCallback } from "react";
import {
    View, Text, FlatList, StyleSheet,
    TouchableOpacity, Alert
} from "react-native";
import { SafeAreaView }       from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons }            from "@expo/vector-icons";
import { fetchHistory, removeHistory } from "../redux/actions";
import MovieCard      from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";

// Chuyển giây → "mm:ss" hoặc "hh:mm:ss"
function formatTime(seconds) {
    if (!seconds) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}

const HistoryScreen = ({ navigation }) => {
    const dispatch       = useDispatch();
    const token          = useSelector(s => s.token);
    const history        = useSelector(s => s.history);
    const historyLoading = useSelector(s => s.historyLoading);

    const load = useCallback(() => {
        if (token) dispatch(fetchHistory(token));
    }, [token]);

    useEffect(() => {
        load();
    }, [load]);

    const handleDelete = (movie) => {
        Alert.alert(
            "Xoá khỏi lịch sử",
            `Xoá "${movie.title}" khỏi lịch sử xem?`,
            [
                { text: "Huỷ", style: "cancel" },
                {
                    text: "Xoá",
                    style: "destructive",
                    onPress: () => dispatch(removeHistory(movie.id, token)),
                },
            ]
        );
    };

    // Chưa đăng nhập
    if (!token) {
        return (
            <SafeAreaView style={styles.center}>
                <Ionicons name="time-outline" size={60} color="#2a2a2a" />
                <Text style={styles.emptyTitle}>Chưa đăng nhập</Text>
                <Text style={styles.emptyText}>Đăng nhập để xem lịch sử phim đã xem</Text>
                <TouchableOpacity
                    style={styles.loginBtn}
                    onPress={() => navigation.navigate("Login")}
                >
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
                keyExtractor={item => String(item.id)}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View>
                        <View style={styles.cardRow}>
                            <View style={styles.cardFlex}>
                                <MovieCard
                                    title={item.title}
                                    genre={item.genres ? item.genres.join(", ") : item.genre}
                                    year={item.year}
                                    rating={item.rating}
                                    poster_url={item.poster_url}
                                    onPress={() => navigation.navigate("VideoPlayer", { movie: item, startAt: item.progress_seconds })}
                                />
                            </View>
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                                <Ionicons name="trash-outline" size={20} color="#555" />
                            </TouchableOpacity>
                        </View>
                        {/* Thanh tiến trình */}
                        <View style={styles.progressWrap}>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${Math.min(((item.progress_seconds || 0) / (item.duration_seconds || 7200)) * 100, 100)}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.progressText}>
                                Đã xem: {formatTime(item.progress_seconds)}
                            </Text>
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
    },
    center: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    heading: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        padding: 16,
        paddingBottom: 8,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    cardRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    cardFlex: {
        flex: 1,
    },
    deleteBtn: {
        paddingHorizontal: 12,
        paddingVertical: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    progressWrap: {
        marginTop: -10,
        marginBottom: 14,
        paddingHorizontal: 4,
    },
    progressBar: {
        height: 3,
        backgroundColor: "#2a2a2a",
        borderRadius: 2,
        marginBottom: 4,
    },
    progressFill: {
        height: 3,
        backgroundColor: "#e50914",
        borderRadius: 2,
    },
    progressText: {
        color: "#555",
        fontSize: 11,
    },
    emptyTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 16,
    },
    emptyText: {
        color: "#6e6e6e",
        fontSize: 14,
        textAlign: "center",
        marginTop: 8,
    },
    loginBtn: {
        marginTop: 20,
        backgroundColor: "#e50914",
        borderRadius: 8,
        paddingHorizontal: 28,
        paddingVertical: 12,
    },
    loginBtnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 15,
    },
});

export default HistoryScreen;