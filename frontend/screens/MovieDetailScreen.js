import React, { useEffect } from "react";
import {
    View, Text, Image, ScrollView,
    TouchableOpacity, StyleSheet, Linking,
    useWindowDimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons }            from "@expo/vector-icons";
import Tag                     from "../components/Tag";
import { addFavorite, removeFavorite, fetchMovieById } from "../redux/actions";

const ASSETS_MAP = {
    "Avengers: Endgame":       require("../assets/Avenger-Endgame.jpg"),
    "Spider-Man: No Way Home": require("../assets/Spiderman_No_Way_Home.jpg"),
    "Titanic":                 require("../assets/Titanic.jpg"),
    "Zootopia":                require("../assets/Zootopia.jpg"),
    "Paddington in Peru":      require("../assets/Paddington-Peru.jpg"),
};

function normalizeUrl(url) {
    if (!url) return null;
    url = url.trim();
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/t/p/")) return `https://image.tmdb.org${url}`;
    if (url.startsWith("/"))     return `https://image.tmdb.org/t/p/w500${url}`;
    return `https://image.tmdb.org/t/p/w500/${url}`;
}

function resolveSource(movie) {
    if (!movie) return null;
    if (ASSETS_MAP[movie.title]) return ASSETS_MAP[movie.title];
    if (movie.poster_url) return { uri: normalizeUrl(movie.poster_url) };
    if (movie.image)      return movie.image;
    return null;
}

function toWatchableUrl(url) {
    if (!url) return null;
    const m = url.match(/youtube\.com\/embed\/([^?&]+)/);
    if (m) return `https://youtu.be/${m[1]}`;
    return url;
}

const MovieDetailScreen = ({ route, navigation }) => {
    const { width } = useWindowDimensions();
    const POSTER_W = width * 0.55;
    const POSTER_H = POSTER_W * 1.45;

    const { movie: passed } = route.params;
    const dispatch    = useDispatch();
    const token       = useSelector(s => s.token);
    const favoriteIds = useSelector(s => s.favoriteIds);
    const selected    = useSelector(s => s.selectedMovie);

    useEffect(() => {
        if (passed.id && !isNaN(passed.id)) dispatch(fetchMovieById(passed.id));
    }, [passed.id]);

    const movie     = (selected && String(selected.id) === String(passed.id)) ? selected : passed;
    const isFav     = favoriteIds.includes(Number(movie.id));
    const genres    = movie.genres || (movie.genre ? movie.genre.split(", ") : []);
    const imgSource = resolveSource(movie);
    const trailerUrl = toWatchableUrl(movie.trailer_url)
        || `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " trailer")}`;

    const toggleFav = () => {
        if (!token) { navigation.navigate("Login"); return; }
        if (isFav)  dispatch(removeFavorite(Number(movie.id), token));
        else        dispatch(addFavorite(Number(movie.id), token));
    };

    const handleWatch = () => {
        if (!token) { navigation.navigate("Login"); return; }
        navigation.navigate("VideoPlayer", { movie });
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

            {/* ── Header: backdrop + poster ── */}
            <View style={[styles.headerWrap, { width }]}>
                {imgSource && (
                    <Image source={imgSource} style={styles.backdrop} blurRadius={10} />
                )}
                <View style={styles.darkOverlay} />
                {imgSource && (
                    <Image source={imgSource} style={[styles.poster, { width: POSTER_W, height: POSTER_H }]} resizeMode="cover" />
                )}
                <TouchableOpacity style={styles.favBtn} onPress={toggleFav}>
                    <Ionicons
                        name={isFav ? "heart" : "heart-outline"}
                        size={26}
                        color={isFav ? "#e50914" : "#fff"}
                    />
                </TouchableOpacity>
            </View>

            {/* ── Nội dung ── */}
            <View style={styles.content}>
                <Text style={styles.title}>{movie.title}</Text>

                {/* Meta badges */}
                <View style={styles.metaRow}>
                    <View style={styles.metaBadge}>
                        <Text style={styles.metaBadgeText}>{movie.year}</Text>
                    </View>
                    {movie.rating ? (
                        <View style={[styles.metaBadge, styles.ratingBadge]}>
                            <Ionicons name="star" size={12} color="#f5a623" />
                            <Text style={[styles.metaBadgeText, { color: "#f5a623" }]}> {movie.rating}</Text>
                        </View>
                    ) : null}
                    <View style={[styles.metaBadge, styles.hdBadge]}>
                        <Text style={[styles.metaBadgeText, { color: "#46d369" }]}>HD</Text>
                    </View>
                </View>

                {/* Tags thể loại */}
                <View style={styles.tags}>
                    {genres.map((g, i) => <Tag key={i} label={g} color="#e50914" />)}
                </View>

                {/* Đạo diễn */}
                {movie.director ? (
                    <Text style={styles.director}>🎬 {movie.director}</Text>
                ) : null}

                {/* Buttons */}
                <View style={styles.btnGroup}>
                    <TouchableOpacity style={styles.watchBtn} onPress={handleWatch}>
                        <Ionicons name="play" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.watchText}>Xem Phim</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.trailerBtn} onPress={() => Linking.openURL(trailerUrl)}>
                        <Ionicons name="logo-youtube" size={20} color="#fff" style={{ marginRight: 6 }} />
                        <Text style={styles.trailerText}>Trailer</Text>
                    </TouchableOpacity>
                </View>

                {/* Nội dung phim */}
                <Text style={styles.sectionLabel}>Nội dung</Text>
                <Text style={styles.desc}>{movie.description || "Đang cập nhật nội dung..."}</Text>

                {movie.cast_list ? (
                    <>
                        <Text style={styles.sectionLabel}>Diễn viên</Text>
                        <Text style={styles.desc}>{movie.cast_list}</Text>
                    </>
                ) : null}

                <View style={{ height: 40 }} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container:     { flex: 1, backgroundColor: "#0a0a0a" },
    headerWrap:    { height: 380, justifyContent: "center", alignItems: "center", overflow: "hidden", backgroundColor: "#000" },
    backdrop:      { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%", opacity: 0.55 },
    darkOverlay:   { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
    poster:        { borderRadius: 12, borderWidth: 2, borderColor: "rgba(255,255,255,0.12)" },
    favBtn:        { position: "absolute", bottom: 14, right: 16, backgroundColor: "rgba(0,0,0,0.65)", borderRadius: 24, padding: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
    content:       { padding: 18 },
    title:         { color: "#fff", fontSize: 26, fontWeight: "900", letterSpacing: -0.5, marginBottom: 12 },
    metaRow:       { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
    metaBadge:     { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#444", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
    metaBadgeText: { color: "#b3b3b3", fontSize: 12, fontWeight: "600" },
    ratingBadge:   { borderColor: "#f5a62366" },
    hdBadge:       { borderColor: "#46d36966" },
    tags:          { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
    director:      { color: "#b3b3b3", fontSize: 13, marginBottom: 20 },
    btnGroup:      { flexDirection: "row", gap: 12, marginBottom: 28 },
    watchBtn:      { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#e50914", borderRadius: 8, height: 54 },
    watchText:     { color: "#fff", fontSize: 16, fontWeight: "900" },
    trailerBtn:    { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#2a2a2a", borderRadius: 8, height: 54, borderWidth: 1, borderColor: "#444" },
    trailerText:   { color: "#fff", fontSize: 15, fontWeight: "700" },
    sectionLabel:  { color: "#fff", fontSize: 17, fontWeight: "800", marginBottom: 8 },
    desc:          { color: "#bbb", fontSize: 14, lineHeight: 22, marginBottom: 20 },
});

export default MovieDetailScreen;