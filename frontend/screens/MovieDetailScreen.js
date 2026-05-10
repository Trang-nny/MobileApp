import React, { useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import Tag from "../components/Tag";
import { addFavorite, removeFavorite, fetchMovieById } from "../redux/actions";

// Map tên phim → ảnh local (phòng trường hợp API chưa chạy)
const ASSETS_MAP = {
    "Avengers: Endgame":        require("../assets/Avenger-Endgame.jpg"),
    "Spider-Man: No Way Home":  require("../assets/Spiderman_No_Way_Home.jpg"),
    "Titanic":                  require("../assets/Titanic.jpg"),
    "Zootopia":                 require("../assets/Zootopia.jpg"),
    "Paddington in Peru":       require("../assets/Paddington-Peru.jpg"),
};

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

    const toggleFav = () => {
        if (!token) { navigation.navigate("Login"); return; }
        if (isFav)  dispatch(removeFavorite(Number(movie.id), token));
        else        dispatch(addFavorite(Number(movie.id), token));
    };

    // Ưu tiên: ảnh local (từ mock) → ảnh local theo tên → ảnh từ URL API
    const localImage = movie.image || ASSETS_MAP[movie.title];
    const imgSource  = localImage ? localImage : { uri: movie.poster_url };

    return (
        <ScrollView style={styles.container}>
            <Image source={imgSource} style={styles.poster} />
            <TouchableOpacity style={styles.fabHeart} onPress={toggleFav}>
                <Ionicons name={isFav ? "heart" : "heart-outline"} size={26} color={isFav ? "#e50914" : "#fff"} />
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={styles.title}>{movie.title}</Text>
                <Text style={styles.meta}>
                    {movie.year}{movie.rating ? `  ·  ⭐ ${movie.rating}` : ""}{movie.director ? `  ·  ${movie.director}` : ""}
                </Text>

                <View style={styles.tags}>
                    {genres.map((g, i) => <Tag key={i} label={g} color="#e50914" />)}
                    <Tag label="HD" color="#46d369" />
                </View>

                <Text style={styles.label}>Nội dung</Text>
                <Text style={styles.desc}>{movie.description || "Nội dung sẽ được cập nhật từ API."}</Text>

                {movie.cast_list ? (
                    <>
                        <Text style={styles.label}>Diễn viên</Text>
                        <Text style={styles.desc}>{movie.cast_list}</Text>
                    </>
                ) : null}

                {movie.trailer_url ? (
                    <TouchableOpacity style={styles.trailerBtn} onPress={() => Linking.openURL(movie.trailer_url)}>
                        <Ionicons name="logo-youtube" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.trailerText}>Xem Trailer</Text>
                    </TouchableOpacity>
                ) : null}

                <TouchableOpacity style={styles.watchBtn}
                    onPress={() => { if (!token) navigation.navigate("Login"); else alert("Sprint 3 sẽ hoàn thiện tính năng này."); }}>
                    <Ionicons name="play-circle" size={22} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.watchText}>Xem Phim Ngay</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container:   { flex: 1, backgroundColor: "#0a0a0a" },
    poster:      { width: "100%", height: 320, resizeMode: "cover" },
    fabHeart:    { position: "absolute", top: 280, right: 16, backgroundColor: "rgba(0,0,0,0.65)", borderRadius: 24, padding: 8 },
    content:     { padding: 16 },
    title:       { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 6 },
    meta:        { fontSize: 13, color: "#b3b3b3", marginBottom: 12 },
    tags:        { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
    label:       { fontSize: 16, fontWeight: "bold", color: "#fff", marginBottom: 8 },
    desc:        { fontSize: 14, lineHeight: 22, color: "#b3b3b3", marginBottom: 16 },
    trailerBtn:  { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#cc0000", borderRadius: 8, padding: 14, marginBottom: 12 },
    trailerText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
    watchBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#e50914", borderRadius: 8, padding: 16, marginBottom: 32 },
    watchText:   { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default MovieDetailScreen;