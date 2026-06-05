import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH  = (width - 16 * 2 - 12) / 2;   // 2 cột, padding 16, gap 12
const CARD_HEIGHT = CARD_WIDTH * 1.5;              // tỷ lệ poster 2:3

const TMDB_BASE = "https://image.tmdb.org";

function normalizePosterUrl(url) {
    if (!url) return null;
    url = url.trim();
    if (url.startsWith("http://") || url.startsWith("https://"))
        return url.replace(/\/t\/p\/(w\d+|original)\//, "/t/p/w500/");
    if (url.startsWith("/t/p/"))
        return TMDB_BASE + url.replace(/\/t\/p\/(w\d+|original)\//, "/t/p/w500/");
    if (url.startsWith("/"))
        return `${TMDB_BASE}/t/p/w500${url}`;
    return `${TMDB_BASE}/t/p/w500/${url}`;
}

function resolveSource(title, poster_url, image) {
    const norm = normalizePosterUrl(poster_url);
    if (norm)  return { uri: norm };
    if (image) return image;
    return null;
}

const MovieCard = ({
    title, genre, year, rating,
    image, poster_url,
    isFavorite, onPress, onToggleFavorite,
    variant = "grid",   // "grid" | "row"
}) => {
    const source   = resolveSource(title, poster_url, image);
    const showHeart = typeof isFavorite !== "undefined" && onToggleFavorite;
    const [imgErr, setImgErr] = useState(false);

    // ── Variant: "row" (màn hình Yêu thích / Lịch sử) ──
    if (variant === "row") {
        return (
            <TouchableOpacity style={row.card} onPress={onPress} activeOpacity={0.8}>
                {source && !imgErr ? (
                    <Image source={source} style={row.img} resizeMode="cover" onError={() => setImgErr(true)} />
                ) : (
                    <View style={[row.img, row.noImg]}>
                        <Ionicons name="film-outline" size={28} color="#333" />
                    </View>
                )}
                <View style={row.info}>
                    <Text style={row.title} numberOfLines={2}>{title}</Text>
                    <Text style={row.genre} numberOfLines={1}>{genre}</Text>
                    <View style={row.meta}>
                        <Text style={row.metaText}>📅 {year}</Text>
                        {rating ? <Text style={row.metaRating}>⭐ {rating}</Text> : null}
                    </View>
                </View>
                {showHeart && (
                    <TouchableOpacity style={row.heartWrap} onPress={onToggleFavorite}>
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={22}
                            color={isFavorite ? "#e50914" : "#888"}
                        />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    }

    // ── Variant: "grid" (màn hình Home) ───
    return (
        <TouchableOpacity style={grid.card} onPress={onPress} activeOpacity={0.85}>
            {/* Poster */}
            {source && !imgErr ? (
                <Image source={source} style={grid.img} resizeMode="cover" onError={() => setImgErr(true)} />
            ) : (
                <View style={[grid.img, grid.noImg]}>
                    <Ionicons name="film-outline" size={36} color="#333" />
                </View>
            )}

            {/* Badge rating góc trên phải */}
            {rating ? (
                <View style={grid.badge}>
                    <Text style={grid.badgeText}>⭐ {rating}</Text>
                </View>
            ) : null}

            {/* Nút tim */}
            {showHeart && (
                <TouchableOpacity style={grid.heart} onPress={onToggleFavorite}>
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={18}
                        color={isFavorite ? "#e50914" : "#fff"}
                    />
                </TouchableOpacity>
            )}

            {/* Overlay thông tin phía dưới poster */}
            <View style={grid.overlay}>
                <Text style={grid.title} numberOfLines={1}>{title}</Text>
                <Text style={grid.year}>{year}</Text>
            </View>
        </TouchableOpacity>
    );
};

// ── Styles: grid ──
const grid = StyleSheet.create({
    card:   {
        width:  CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#1c1c1c",
        marginBottom: 14,
    },
    img:    { width: "100%", height: "100%" },
    noImg:  { backgroundColor: "#111", justifyContent: "center", alignItems: "center" },
    badge:  {
        position: "absolute", top: 8, right: 8,
        backgroundColor: "rgba(0,0,0,0.75)",
        paddingHorizontal: 6, paddingVertical: 2,
        borderRadius: 4,
    },
    badgeText: { color: "#f5a623", fontSize: 11, fontWeight: "bold" },
    heart:  {
        position: "absolute", top: 8, left: 8,
        backgroundColor: "rgba(0,0,0,0.55)",
        borderRadius: 14, padding: 4,
    },
    overlay: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        paddingHorizontal: 8, paddingVertical: 8,
        backgroundColor: "rgba(0,0,0,0.65)",
    },
    title:  { color: "#fff",    fontSize: 13, fontWeight: "bold", marginBottom: 2 },
    year:   { color: "#b3b3b3", fontSize: 11 },
});

// ── Styles: row ──
const row = StyleSheet.create({
    card:     {
        backgroundColor: "#1c1c1c", borderRadius: 10,
        overflow: "hidden", marginBottom: 12,
        flexDirection: "row",
        borderWidth: 1, borderColor: "#2a2a2a",
    },
    img:      { width: 85, height: 115 },
    noImg:    { backgroundColor: "#111", justifyContent: "center", alignItems: "center" },
    info:     { flex: 1, padding: 12, justifyContent: "center" },
    title:    { fontSize: 15, fontWeight: "bold", color: "#fff", marginBottom: 4 },
    genre:    { fontSize: 12, color: "#b3b3b3", marginBottom: 8 },
    meta:     { flexDirection: "row", gap: 12 },
    metaText: { fontSize: 12, color: "#b3b3b3" },
    metaRating: { fontSize: 12, color: "#f5a623" },
    heartWrap:{ justifyContent: "center", paddingRight: 14 },
});

export default MovieCard;