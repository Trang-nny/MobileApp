import React, { useEffect, useState } from "react";
import {
    View, Text, FlatList, StyleSheet,
    TouchableOpacity, ScrollView
} from "react-native";
import { SafeAreaView }          from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { fetchPopularMovies, fetchMovies } from "../redux/actions";
import MovieCard      from "../components/MovieCard";
import SearchBar      from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";

const API = "http://192.168.1.39:5555/api/v1";

const ASSETS_MAP = {
    "Avengers: Endgame":       require("../assets/Avenger-Endgame.jpg"),
    "Spider-Man: No Way Home": require("../assets/Spiderman_No_Way_Home.jpg"),
    "Titanic":                 require("../assets/Titanic.jpg"),
    "Zootopia":                require("../assets/Zootopia.jpg"),
    "Paddington in Peru":      require("../assets/Paddington-Peru.jpg"),
};

const TMDB_BASE = "https://image.tmdb.org";

function normalizePoster(url) {
    if (!url) return null;
    if (typeof url !== "string") return url;
    const s = url.trim();
    if (s.startsWith("http://") || s.startsWith("https://"))
        return s.replace(/\/t\/p\/(w\d+|original)\//, "/t/p/w500/");
    if (s.startsWith("/t/p/")) return TMDB_BASE + s.replace(/\/t\/p\/(w\d+|original)\//, "/t/p/w500/");
    if (s.startsWith("/")) return `${TMDB_BASE}/t/p/w500${s}`;
    return `${TMDB_BASE}/t/p/w500/${s}`;
}

const MOCK_MOVIES = [
    { id: "1", title: "Avengers: Endgame",       genre: "Hành động, Khoa học viễn tưởng", year: 2019, rating: 8.4, image: ASSETS_MAP["Avengers: Endgame"] },
    { id: "2", title: "Spider-Man: No Way Home", genre: "Hành động, Phiêu lưu",           year: 2021, rating: 8.2, image: ASSETS_MAP["Spider-Man: No Way Home"] },
    { id: "3", title: "Titanic",                  genre: "Lãng mạn, Chính kịch",           year: 1997, rating: 7.9, image: ASSETS_MAP["Titanic"] },
    { id: "4", title: "Zootopia",                 genre: "Hoạt hình, Hài hước",            year: 2016, rating: 8.0, image: ASSETS_MAP["Zootopia"] },
    { id: "5", title: "Paddington in Peru",       genre: "Hài hước, Gia đình",             year: 2024, rating: 7.2, image: ASSETS_MAP["Paddington in Peru"] },
];

const HomeScreen = ({ navigation }) => {
    const dispatch      = useDispatch();
    const apiMovies     = useSelector(s => s.movies);
    const moviesLoading = useSelector(s => s.moviesLoading);

    const [search,      setSearch]      = useState("");
    const [activeGenre, setActiveGenre] = useState({ label: "Tất cả", id: "" });
    // genres = [{ id, name }, ...]
    const [genres,      setGenres]      = useState([]);

    // Fetch genres động từ API
    useEffect(() => {
        fetch(`${API}/genres`)
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setGenres(data);
            })
            .catch(() => {});
    }, []);

    useEffect(() => { dispatch(fetchPopularMovies()); }, []);

    useEffect(() => {
        const params = {};
        if (search)            params.search   = search;
        if (activeGenre.id)    params.genre_id = activeGenre.id;
        const t = setTimeout(() => dispatch(fetchMovies(params)), 400);
        return () => clearTimeout(t);
    }, [search, activeGenre]);

    const baseMovies = apiMovies.length > 0 ? apiMovies : MOCK_MOVIES;
    const displayMovies = baseMovies.map(m => {
        const poster = normalizePoster(m.poster_url);
        return {
            ...m,
            poster_url: poster || m.poster_url,
            image: ASSETS_MAP[m.title] || m.image || null,
        };
    });

    const ListHeader = () => (
        <View>
            <SearchBar value={search} onChangeText={setSearch} />

            {/* Chip thể loại — fetch động */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.genreRow}
                contentContainerStyle={styles.genreContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Chip "Tất cả" */}
                <TouchableOpacity
                    key="all"
                    style={[styles.chip, activeGenre.id === "" && styles.chipActive]}
                    onPress={() => setActiveGenre({ label: "Tất cả", id: "" })}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.chipText, activeGenre.id === "" && styles.chipTextActive]}>
                        Tất cả
                    </Text>
                </TouchableOpacity>

                {genres.map(g => (
                    <TouchableOpacity
                        key={g.id}
                        style={[styles.chip, activeGenre.id === g.id && styles.chipActive]}
                        onPress={() => setActiveGenre({ label: g.name, id: g.id })}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.chipText, activeGenre.id === g.id && styles.chipTextActive]}>
                            {g.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.heading}>
                {activeGenre.id === "" ? "Phim thịnh hành" : activeGenre.label}
            </Text>
        </View>
    );

    if (moviesLoading && displayMovies.length === 0) return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={displayMovies}
                keyExtractor={item => String(item.id)}
                ListHeaderComponent={<ListHeader />}
                renderItem={({ item }) => (
                    <MovieCard
                        title={item.title}
                        genre={item.genres ? item.genres.join(", ") : item.genre}
                        year={item.year}
                        rating={item.rating}
                        image={item.image}
                        poster_url={item.poster_url}
                        onPress={() => navigation.navigate("MovieDetail", { movie: item })}
                    />
                )}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                    <Text style={styles.empty}>Không tìm thấy phim nào</Text>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container:      { flex: 1, backgroundColor: "#0a0a0a", paddingTop: 10 },
    genreRow:       { marginTop: 12, marginBottom: 4 },
    genreContent:   { paddingHorizontal: 16, gap: 10 },
    chip:           {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#2a2a2a",
        backgroundColor: "#1c1c1c",
    },
    chipActive:     { backgroundColor: "#e50914", borderColor: "#e50914" },
    chipText:       { color: "#b3b3b3", fontSize: 14, fontWeight: "500" },
    chipTextActive: { color: "#fff",    fontWeight: "bold" },
    heading:        { color: "#fff", fontSize: 18, fontWeight: "bold", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
    list:           { paddingHorizontal: 16, paddingBottom: 24 },
    empty:          { color: "#6e6e6e", textAlign: "center", marginTop: 60, fontSize: 15 },
});

export default HomeScreen;