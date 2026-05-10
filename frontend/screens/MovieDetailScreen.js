import React, { useEffect } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Linking, Dimensions } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import Tag from "../components/Tag";
import { addFavorite, removeFavorite, fetchMovieById } from "../redux/actions";

const { width } = Dimensions.get("window");

const ASSETS_MAP = {
    "Avengers: Endgame": require("../assets/Avenger-Endgame.jpg"),
    "Spider-Man: No Way Home": require("../assets/Spiderman_No_Way_Home.jpg"),
    "Titanic": require("../assets/Titanic.jpg"),
    "Zootopia": require("../assets/Zootopia.jpg"),
    "Paddington in Peru": require("../assets/Paddington-Peru.jpg"),
};

const MovieDetailScreen = ({ route, navigation }) => {
    const { movie: passed } = route.params;
    const dispatch = useDispatch();
    const token = useSelector(s => s.token);
    const favoriteIds = useSelector(s => s.favoriteIds);
    const selected = useSelector(s => s.selectedMovie);

    useEffect(() => {
        if (passed.id && !isNaN(passed.id)) dispatch(fetchMovieById(passed.id));
    }, [passed.id]);

    const movie = (selected && String(selected.id) === String(passed.id)) ? selected : passed;
    const isFav = favoriteIds.includes(Number(movie.id));
    const genres = movie.genres || (movie.genre ? movie.genre.split(", ") : []);

    const toggleFav = () => {
        if (!token) { navigation.navigate("Login"); return; }
        if (isFav) dispatch(removeFavorite(Number(movie.id), token));
        else dispatch(addFavorite(Number(movie.id), token));
    };

    const imgSource = ASSETS_MAP[movie.title] ? ASSETS_MAP[movie.title] : { uri: movie.poster_url };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header Image Section */}
            <View style={styles.imageHeader}>
                {/* 1. Ảnh nền mờ: Dùng 'cover' để lấp đầy 100% không gian, không để lại khoảng đen */}
                <Image source={imgSource} style={styles.blurredBackground} resizeMode="cover" blurRadius={10} />
                
                {/* 2. Lớp phủ tối: Giúp ảnh nền chìm xuống và làm nổi bật ảnh chính */}
                <View style={styles.overlay} />
                
                {/* 3. Ảnh chính: Dùng 'contain' để hiện trọn vẹn poster không mất chi tiết */}
                <Image source={imgSource} style={styles.mainPoster} resizeMode="contain" />

                {/* 4. Nút yêu thích */}
                <TouchableOpacity style={styles.fabHeart} onPress={toggleFav}>
                    <Ionicons name={isFav ? "heart" : "heart-outline"} size={26} color={isFav ? "#e50914" : "#fff"} />
                </TouchableOpacity>
            </View>

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
                <Text style={styles.desc}>{movie.description || "Nội dung phim đang được cập nhật."}</Text>

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

                <TouchableOpacity 
                    style={styles.watchBtn}
                    onPress={() => { if (!token) navigation.navigate("Login"); else alert("Tính năng xem phim sẽ khả dụng ở Sprint 3."); }}
                >
                    <Ionicons name="play-circle" size={24} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.watchText}>Xem Phim Ngay</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0a0a0a" },
    imageHeader: {
        width: "100%",
        height: 400, // Tăng chiều cao lên một chút cho thoáng
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden", // Đảm bảo ảnh không tràn ra ngoài
    },
    blurredBackground: {
        ...StyleSheet.absoluteFillObject,
        width: "100%",
        height: "100%",
        opacity: 0.6, // Tăng độ đậm của nền mờ
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)", // Phủ một lớp đen mờ để tạo chiều sâu
    },
    mainPoster: {
        width: "85%",
        height: "85%",
        // Đổ bóng cho ảnh chính thêm phần sang trọng
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    fabHeart: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: "rgba(30, 30, 30, 0.9)",
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#333",
    },
    content: { padding: 20 },
    title: { fontSize: 26, fontWeight: "bold", color: "#fff", marginBottom: 6 },
    meta: { fontSize: 14, color: "#b3b3b3", marginBottom: 16 },
    tags: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20, gap: 8 },
    label: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 8 },
    desc: { fontSize: 15, lineHeight: 24, color: "#b3b3b3", marginBottom: 20 },
    trailerBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#222", borderRadius: 8, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#444" },
    trailerText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
    watchBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#e50914", borderRadius: 8, padding: 16, marginBottom: 40 },
    watchText: { color: "#fff", fontSize: 17, fontWeight: "bold" },
});

export default MovieDetailScreen;