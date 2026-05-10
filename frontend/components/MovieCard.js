import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MovieCard = ({ title, genre, year, rating, image, poster_url, isFavorite, onPress, onToggleFavorite }) => {
    const source = image ? image : { uri: poster_url };
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
            <Image
                source={source}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.info}>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                <Text style={styles.genre}  numberOfLines={1}>{genre}</Text>
                <View style={styles.row}>
                    <Text style={styles.year}>📅 {year}</Text>
                    {rating ? <Text style={styles.rating}>⭐ {rating}</Text> : null}
                </View>
            </View>
            {onToggleFavorite && (
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
    card:   { backgroundColor: "#1c1c1c", borderRadius: 8, overflow: "hidden", marginBottom: 14, flexDirection: "row", borderWidth: 1, borderColor: "#2a2a2a" },
    image:  { width: 90, height: 120 },
    info:   { flex: 1, padding: 12, justifyContent: "center" },
    title:  { fontSize: 16, fontWeight: "bold", color: "#ffffff", marginBottom: 4 },
    genre:  { fontSize: 12, color: "#b3b3b3", marginBottom: 8 },
    row:    { flexDirection: "row", gap: 12 },
    year:   { fontSize: 12, color: "#b3b3b3" },
    rating: { fontSize: 12, color: "#f5a623" },
    heart:  { justifyContent: "center", paddingRight: 12 },
});

export default MovieCard;