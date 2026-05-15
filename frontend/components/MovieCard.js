import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Map ảnh local theo tên phim
const ASSETS_MAP = {
    "Avengers: Endgame":       require("../assets/Avenger-Endgame.jpg"),
    "Spider-Man: No Way Home": require("../assets/Spiderman_No_Way_Home.jpg"),
    "Titanic":                 require("../assets/Titanic.jpg"),
    "Zootopia":                require("../assets/Zootopia.jpg"),
    "Paddington in Peru":      require("../assets/Paddington-Peru.jpg"),
};

// Trả về source hợp lệ: local asset → poster_url → image prop
function resolveSource(title, poster_url, image) {
    if (ASSETS_MAP[title])  return ASSETS_MAP[title];
    if (poster_url)         return { uri: poster_url };
    if (image)              return image;
    return null;
}

const MovieCard = ({ title, genre, year, rating, image, poster_url, isFavorite, onPress, onToggleFavorite }) => {
    const source = resolveSource(title, poster_url, image);
    // Chỉ hiện nút tim khi đây là context yêu thích (isFavorite được truyền rõ ràng, kể cả false)
    const showHeart = typeof isFavorite !== "undefined" && onToggleFavorite;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            {source ? (
                <Image
                    source={source}
                    style={styles.image}
                    resizeMode="cover"
                />
            ) : (
                // Fallback khi không có ảnh nào
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