import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ASSETS_MAP = {
    "Avengers: Endgame":       require("../assets/Avenger-Endgame.jpg"),
    "Spider-Man: No Way Home": require("../assets/Spiderman_No_Way_Home.jpg"),
    "Titanic":                 require("../assets/Titanic.jpg"),
    "Zootopia":                require("../assets/Zootopia.jpg"),
    "Paddington in Peru":      require("../assets/Paddington-Peru.jpg"),
};

const TMDB_BASE = "https://image.tmdb.org";

// Xử lý mọi dạng poster_url từ DB:
// 1. Full URL:    "https://image.tmdb.org/t/p/w1280/abc.jpg"  → chuẩn hoá về w500
// 2. Path:        "/t/p/w500/abc.jpg"                         → thêm domain TMDB
// 3. Path ngắn:  "/abc.jpg"                                   → thêm domain + path đầy đủ
// 4. URL khác:    "https://example.com/img.jpg"               → dùng nguyên
function normalizePosterUrl(url) {
    if (!url) return null;
    url = url.trim();

    // Đã là full URL
    if (url.startsWith("http://") || url.startsWith("https://")) {
        // Chuẩn hoá size TMDB về w500
        return url.replace(/\/t\/p\/(w\d+|original)\//, "/t/p/w500/");
    }

    // Path dạng /t/p/.../file.jpg
    if (url.startsWith("/t/p/")) {
        return TMDB_BASE + url.replace(/\/t\/p\/(w\d+|original)\//, "/t/p/w500/");
    }

    // Path ngắn dạng /abc.jpg — gắn domain + path mặc định
    if (url.startsWith("/")) {
        return `${TMDB_BASE}/t/p/w500${url}`;
    }

    // Tên file thuần: "abc.jpg"
    return `${TMDB_BASE}/t/p/w500/${url}`;
}

function resolveSource(title, poster_url, image) {
    if (ASSETS_MAP[title]) return ASSETS_MAP[title];
    const normalized = normalizePosterUrl(poster_url);
    if (normalized)    return { uri: normalized };
    if (image)         return image;
    return null;
}

const MovieCard = ({ title, genre, year, rating, image, poster_url, isFavorite, onPress, onToggleFavorite }) => {
    const source    = resolveSource(title, poster_url, image);
    const showHeart = typeof isFavorite !== "undefined" && onToggleFavorite;
    const [imgError, setImgError] = useState(false);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            {source && !imgError ? (
                <Image
                    source={source}
                    style={styles.image}
                    resizeMode="cover"
                    onError={() => setImgError(true)}
                />
            ) : (
                <View style={[styles.image, styles.noImage]}>
                    <Ionicons name="film-outline" size={28} color="#333" />
                </View>
            )}

            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                <Text style={styles.genre}  numberOfLines={1}>{genre}</Text>
                <View style={styles.row}>
                    <Text style={styles.year}>📅 {year}</Text>
                    {rating ? <Text style={styles.rating}>⭐ {rating}</Text> : null}
                </View>
            </View>

            {showHeart && (
                <TouchableOpacity style={styles.heart} onPress={onToggleFavorite}>
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={22}
                        color={isFavorite ? "#e50914" : "#888"}
                    />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card:    { backgroundColor: "#1c1c1c", borderRadius: 8, overflow: "hidden", marginBottom: 14, flexDirection: "row", borderWidth: 1, borderColor: "#2a2a2a" },
    image:   { width: 90, height: 120 },
    noImage: { backgroundColor: "#111", justifyContent: "center", alignItems: "center" },
    info:    { flex: 1, padding: 12, justifyContent: "center" },
    title:   { fontSize: 16, fontWeight: "bold", color: "#ffffff", marginBottom: 4 },
    genre:   { fontSize: 12, color: "#b3b3b3", marginBottom: 8 },
    row:     { flexDirection: "row", gap: 12 },
    year:    { fontSize: 12, color: "#b3b3b3" },
    rating:  { fontSize: 12, color: "#f5a623" },
    heart:   { justifyContent: "center", paddingRight: 12 },
});

export default MovieCard;