import React, { useEffect } from "react";
import {
    View, Text, Image, ScrollView,
    TouchableOpacity, StyleSheet, Linking, Dimensions
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import Tag from "../components/Tag";
import { addFavorite, removeFavorite, fetchMovieById } from "../redux/actions";

const { width } = Dimensions.get("window");

const ASSETS_MAP = {
    "Avengers: Endgame":       require("../assets/Avenger-Endgame.jpg"),
    "Spider-Man: No Way Home": require("../assets/Spiderman_No_Way_Home.jpg"),
    "Titanic":                 require("../assets/Titanic.jpg"),
    "Zootopia":                require("../assets/Zootopia.jpg"),
    "Paddington in Peru":      require("../assets/Paddington-Peru.jpg"),
};

function normalizeUrl(url) {
    if (!url) return null;
    if (typeof url !== "string") return url;
    url = url.trim();
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/t/p/")) return `https://image.tmdb.org${url}`;
    if (url.startsWith("/")) return `https://image.tmdb.org/t/p/w500${url}`;
    return `https://image.tmdb.org/t/p/w500/${url}`;
}

function resolveSource(movie) {
    if (!movie) return null;
    // Ưu tiên asset cục bộ nếu có title match (tránh ảnh TMDB bị chặn)
    if (ASSETS_MAP[movie.title]) return ASSETS_MAP[movie.title];
    // Fallback sang poster_url từ API
    if (movie.poster_url) return { uri: normalizeUrl(movie.poster_url) };
    if (movie.image) return movie.image;
    return null;
}

function toWatchableUrl(url) {
    if (!url) return null;
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
    if (embedMatch) return `https://youtu.be/${embedMatch[1]}`;
    return url;
}

function fallbackTrailerUrl(title, year) {
    const q = encodeURIComponent(`${title} ${year || ""} official trailer`);
    return `https://www.youtube.com/results?search_query=${q}`;
}

const MovieDetailScreen = ({ route, navigation }) => {
    const { movie: passed } = route.params;
    const dispatch    = useDispatch();
    const token       = useSelector(s => s.token);
    const favoriteIds = useSelector(s => s.favoriteIds);
    const selected    = useSelector(s => s.selectedMovie);

    useEffect(() => {
        if (passed.id && !isNaN(passed.id)) dispatch(fetchMovieById(passed.id));
    }, [passed.id]);

    const movie  = (selected && String(selected.id) === String(passed.id)) ? selected : passed;
    const isFav  = favoriteIds.includes(Number(movie.id));
    const genres = movie.genres || (movie.genre ? movie.genre.split(", ") : []);

    const trailerUrl = toWatchableUrl(movie.trailer_url) || fallbackTrailerUrl(movie.title, movie.year);

    const toggleFav = () => {
        if (!token) { navigation.navigate("Login"); return; }
        if (isFav)  dispatch(removeFavorite(Number(movie.id), token));
        else        dispatch(addFavorite(Number(movie.id), token));
    };

    const handleWatch = () => {
        if (!token) { navigation.navigate("Login"); return; }
        navigation.navigate("VideoPlayer", { movie });
    };

    const imgSource = resolveSource(movie);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header section với hiệu ứng Backdrop */}
            <View style={styles.headerContainer}>
                {/* Ảnh nền mờ bao phủ để lấp khoảng trống */}
                <Image source={imgSource} style={styles.backdrop} blurRadius={10} />
                <View style={styles.darkOverlay} />
                
                {/* Ảnh chính hiển thị trọn vẹn */}
                <Image source={imgSource} style={styles.mainPoster} resizeMode="contain" />

                {/* Nút Heart được thiết kế lại */}
                <TouchableOpacity style={styles.heartButton} onPress={toggleFav}>
                    <Ionicons
                        name={isFav ? "heart" : "heart-outline"}
                        size={28}
                        color={isFav ? "#e50914" : "#fff"}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{movie.title}</Text>
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>{movie.year}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.metaText}>⭐ {movie.rating || "N/A"}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.metaText}>🎬 {movie.director || "Updating"}</Text>
                </View>

                <View style={styles.tags}>
                    {genres.map((g, i) => <Tag key={i} label={g} color="#333" />)}
                    <Tag label="HD" color="#46d369" />
                </View>

                <Text style={styles.label}>Nội dung</Text>
                <Text style={styles.desc}>{movie.description || "Nội dung sẽ được cập nhật từ API."}</Text>

                {movie.cast_list && (
                    <>
                        <Text style={styles.label}>Diễn viên</Text>
                        <Text style={styles.desc}>{movie.cast_list}</Text>
                    </>
                )}

                <View style={styles.buttonGroup}>
                    <TouchableOpacity style={styles.watchBtn} onPress={handleWatch}>
                        <Ionicons name="play" size={22} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.watchText}>Xem Phim</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.trailerBtn} onPress={() => Linking.openURL(trailerUrl)}>
                        <Ionicons name="logo-youtube" size={22} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.trailerText}>Trailer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0a0a0a" },
    headerContainer: {
        width: "100%",
        height: 420,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        backgroundColor: "#000"
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
        opacity: 0.5,
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    mainPoster: {
        width: width * 0.65,
        height: "85%",
        borderRadius: 12,
        // Đổ bóng cho poster nổi bật
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
    },
    heartButton: {
        position: "absolute",
        bottom: 15,
        right: 20,
        backgroundColor: "rgba(255,255,255,0.15)",
        padding: 10,
        borderRadius: 30,
        backdropFilter: "blur(10px)" // Chỉ tác dụng trên một số môi trường, dùng tạm mờ nền
    },
    content: { padding: 20 },
    title: { fontSize: 28, fontWeight: "bold", color: "#fff", marginBottom: 10 },
    metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    metaText: { color: "#b3b3b3", fontSize: 14 },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#555", marginHorizontal: 10 },
    tags: { flexDirection: "row", flexWrap: "wrap", marginBottom: 25, gap: 8 },
    label: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 8 },
    desc: { fontSize: 15, lineHeight: 24, color: "#bbb", marginBottom: 20 },
    
    buttonGroup: { flexDirection: "row", gap: 12, marginTop: 10 },
    watchBtn: { 
        flex: 2, 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "#e50914", 
        borderRadius: 8, 
        height: 55 
    },
    watchText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    trailerBtn: { 
        flex: 1, 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "center", 
        backgroundColor: "#2a2a2a", 
        borderRadius: 8, 
        height: 55,
        borderWidth: 1,
        borderColor: "#444"
    },
    trailerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default MovieDetailScreen;