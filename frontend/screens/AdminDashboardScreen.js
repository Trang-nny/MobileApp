import React, { useEffect, useState } from "react";
import {
    View, Text, StyleSheet,
    ScrollView, Alert, ActivityIndicator, Image, Platform, useWindowDimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons }     from "@expo/vector-icons";
import { useSelector }  from "react-redux";
import { API }          from "../redux/actions";

// ── Card thống kê ──
const StatCard = ({ icon, label, value, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
        <Ionicons name={icon} size={26} color={color} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

// ── Hàng phim top lượt xem ───
const TopMovieRow = ({ index, movie }) => {
    const rankColor = 
            index === 0 ? "#ffb703" :
            index === 1 ? "#ffffff" :
            index === 2 ? "#fb8500" :
            "#555555";
    return (
        <View style={styles.topRow}>
            <Text style={[styles.topRank, { color: rankColor }]}>#{index + 1}</Text>
            {movie.poster_url ? (
                <Image
                    source={{ uri: movie.poster_url }}
                    style={styles.topPoster}
                    onError={() => {}}
                />
            ) : (
                <View style={[styles.topPoster, styles.topPosterFallback]}>
                    <Ionicons name="film-outline" size={14} color="#333" />
                </View>
            )}
            <View style={styles.topInfo}>
                <Text style={styles.topTitle} numberOfLines={1}>{movie.title}</Text>
                <Text style={styles.topMeta}>{movie.year}</Text>
            </View>
            <View style={styles.topRight}>
                <Text style={styles.topValue}>{movie.view_count?.toLocaleString() ?? "–"}</Text>
                <Text style={styles.topValueLabel}>lượt xem</Text>
            </View>
        </View>
    );
};

// ── Hàng phim top đánh giá ───
const RatingRow = ({ index, movie }) => (
    <View style={styles.topRow}>
        <Text style={[styles.topRank, { color: "#f5a623" }]}>#{index + 1}</Text>
        {movie.poster_url ? (
            <Image
                source={{ uri: movie.poster_url }}
                style={styles.topPoster}
                onError={() => {}}
            />
        ) : (
            <View style={[styles.topPoster, styles.topPosterFallback]}>
                <Ionicons name="film-outline" size={14} color="#333" />
            </View>
        )}
        <View style={styles.topInfo}>
            <Text style={styles.topTitle} numberOfLines={1}>{movie.title}</Text>
            <Text style={styles.topMeta}>{movie.year}</Text>
        </View>
        <View style={styles.topRight}>
            <Text style={[styles.topValue, { color: "#f5a623" }]}>⭐ {movie.rating}</Text>
            <Text style={styles.topValueLabel}>điểm</Text>
        </View>
    </View>
);

export default function AdminDashboardScreen() {
    const { height: windowHeight } = useWindowDimensions();
    const token = useSelector(s => s.token);
    const user  = useSelector(s => s.user);

    const [stats,      setStats]      = useState({ movies: 0, users: 0, genres: 0 });
    const [topViewed,  setTopViewed]  = useState([]);
    const [topRated,   setTopRated]   = useState([]);
    const [loading,    setLoading]    = useState(true);

    useEffect(() => { loadStats(); }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [moviesRes, usersRes, genresRes] = await Promise.all([
                fetch(`${API}/movies?limit=1000`, { headers }),
                fetch(`${API}/admin/users`,        { headers }),
                fetch(`${API}/genres`,             { headers }),
            ]);
            const movies = await moviesRes.json();
            const users  = await usersRes.json();
            const genres = await genresRes.json();

            setStats({
                movies: Array.isArray(movies) ? movies.length : 0,
                users:  Array.isArray(users)  ? users.length  : 0,
                genres: Array.isArray(genres) ? genres.length : 0,
            });

            if (Array.isArray(movies)) {
                const sorted = [...movies].sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0));
                setTopViewed(sorted.slice(0, 5));
                const rated = [...movies].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
                setTopRated(rated.slice(0, 5));
            }
        } catch {
            Alert.alert("Lỗi", "Không tải được thống kê");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["bottom"]}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={[
                    styles.scrollView,
                    Platform.OS === "web" ? { height: windowHeight } : { flex: 1 }
                ]}
                contentContainerStyle={styles.scrollContent}
            >
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

                {/* ── Số liệu tổng quan ── */}
                <Text style={styles.sectionTitle}>Tổng quan hệ thống</Text>
                {loading ? (
                    <ActivityIndicator color="#e50914" style={{ marginVertical: 24 }} />
                ) : (
                    <>
                        <View style={styles.statsRow}>
                            <StatCard icon="film-outline"      label="Phim"       value={stats.movies} color="#e50914" />
                            <StatCard icon="people-outline"    label="Người dùng" value={stats.users}  color="#3b82f6" />
                            <StatCard icon="pricetag-outline"  label="Thể loại"   value={stats.genres} color="#10b981" />
                        </View>

                        {/* ── Top phim xem nhiều ── */}
                        {topViewed.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Top phim xem nhiều nhất</Text>
                                <View style={styles.listCard}>
                                    {topViewed.map((m, i) => (
                                        <TopMovieRow key={String(m.id)} index={i} movie={m} />
                                    ))}
                                </View>
                            </>
                        )}

                        {/* ── Top phim đánh giá cao ── */}
                        {topRated.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Top phim đánh giá cao nhất</Text>
                                <View style={styles.listCard}>
                                    {topRated.map((m, i) => (
                                        <RatingRow key={String(m.id)} index={i} movie={m} />
                                    ))}
                                </View>
                            </>
                        )}
                    </>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: "#0a0a0a",
    },
    scrollView: {
        ...Platform.select({
            web: {
                overflowY: "auto",
            },
            default: {
                flex: 1
            }
        })
    },
    scrollContent: { 
        paddingBottom: 20,
    },

    header:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center",
                    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 },
    greeting:     { color: "#fff", fontSize: 22, fontWeight: "900" },
    subGreet:     { color: "#777", fontSize: 13, marginTop: 2 },
    badge:        { flexDirection: "row", alignItems: "center", gap: 5,
                    backgroundColor: "#e509141a", borderRadius: 20,
                    paddingHorizontal: 12, paddingVertical: 6,
                    borderWidth: 1, borderColor: "#e5091433" },
    badgeText:    { color: "#e50914", fontSize: 11, fontWeight: "800", letterSpacing: 1 },

    sectionTitle: { color: "#555", fontSize: 11, fontWeight: "700", letterSpacing: 1.2,
                    textTransform: "uppercase", marginHorizontal: 20,
                    marginBottom: 12, marginTop: 8 },

    statsRow:     { flexDirection: "row", marginHorizontal: 16, gap: 10, marginBottom: 24 },
    statCard:     { flex: 1, backgroundColor: "#141414", borderRadius: 12, padding: 14,
                    alignItems: "center", gap: 6, borderLeftWidth: 3,
                    borderWidth: 1, borderColor: "#1e1e1e" },
    statValue:    { color: "#fff", fontSize: 22, fontWeight: "900" },
    statLabel:    { color: "#666", fontSize: 11, textAlign: "center" },

    listCard:     { marginHorizontal: 16, marginBottom: 20, backgroundColor: "#141414",
                    borderRadius: 14, borderWidth: 1, borderColor: "#1e1e1e", overflow: "hidden" },
    topRow:       { flexDirection: "row", alignItems: "center", paddingHorizontal: 14,
                    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#1e1e1e",
                    gap: 10 },
    topRank:      { fontSize: 13, fontWeight: "900", width: 26, textAlign: "center" },
    topPoster:    { width: 36, height: 50, borderRadius: 5, backgroundColor: "#1c1c1c" },
    topPosterFallback: { justifyContent: "center", alignItems: "center" },
    topInfo:      { flex: 1 },
    topTitle:     { color: "#fff", fontSize: 13, fontWeight: "700" },
    topMeta:      { color: "#666", fontSize: 11, marginTop: 2 },
    topRight:     { alignItems: "flex-end" },
    topValue:     { color: "#fff", fontSize: 13, fontWeight: "800" },
    topValueLabel:{ color: "#555", fontSize: 10, marginTop: 1 },
});