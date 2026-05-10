import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchPopularMovies, fetchMovies } from "../redux/actions";
import MovieCard      from "../components/MovieCard";
import SearchBar      from "../components/SearchBar";
import LoadingSpinner from "../components/LoadingSpinner";
import { SafeAreaView } from "react-native-safe-area-context";

const GENRE_MAP = {
    "Tất cả": "",
    "Hành động": 1,
    "Phiêu lưu": 3,
    "Hoạt hình": 4,
    "Hài hước": 5,
    "Lãng mạn": 7
};

const ASSETS_MAP = {
    "Avengers: Endgame": require("../assets/Avenger-Endgame.jpg"),
    "Spider-Man: No Way Home": require("../assets/Spiderman_No_Way_Home.jpg"),
    "Titanic": require("../assets/Titanic.jpg"),
    "Zootopia": require("../assets/Zootopia.jpg"),
    "Paddington in Peru": require("../assets/Paddington-Peru.jpg"),
};

const MOCK_MOVIES = [
    { id: "1", title: "Avengers: Endgame",       genre: "Hành động, Khoa học viễn tưởng", year: 2019, rating: 8.4, image: ASSETS_MAP["Avengers: Endgame"] },
    { id: "2", title: "Spider-Man: No Way Home", genre: "Hành động, Phiêu lưu",           year: 2021, rating: 8.2, image: ASSETS_MAP["Spider-Man: No Way Home"] },
    { id: "3", title: "Titanic",                  genre: "Lãng mạn, Chính kịch",           year: 1997, rating: 7.9, image: ASSETS_MAP["Titanic"] },
    { id: "4", title: "Zootopia",                 genre: "Hoạt hình, Hài hước",            year: 2016, rating: 8.0, image: ASSETS_MAP["Zootopia"] },
    { id: "5", title: "Paddington in Peru",       genre: "Hài hước, Gia đình",             year: 2024, rating: 7.2, image: ASSETS_MAP["Paddington in Peru"] },
];

const GENRES = Object.keys(GENRE_MAP);

const HomeScreen = ({ navigation }) => {
    const dispatch      = useDispatch();
    const apiMovies     = useSelector(s => s.movies);
    const moviesLoading = useSelector(s => s.moviesLoading);
    const [search,      setSearch]      = useState("");
    const [activeGenre, setActiveGenre] = useState("Tất cả");

    useEffect(() => { dispatch(fetchPopularMovies()); }, []);

    useEffect(() => {
        const params = {};
        if (search) params.search = search;
        if (activeGenre !== "Tất cả") params.genre_id = GENRE_MAP[activeGenre];
        const t = setTimeout(() => dispatch(fetchMovies(params)), 400);
        return () => clearTimeout(t);
    }, [search, activeGenre]);

    const baseMovies = apiMovies.length > 0 ? apiMovies : MOCK_MOVIES;
    const displayMovies = baseMovies.map(m => ({
        ...m,
        image: ASSETS_MAP[m.title] || m.image
    })).filter(m => m.title.toLowerCase().includes(search.toLowerCase()));

    if (moviesLoading && displayMovies.length === 0) return <LoadingSpinner />;

    return (
        <SafeAreaView style={[styles.container, { paddingTop: 10 }]}>
            <SearchBar value={search} onChangeText={setSearch} />

            <ScrollView horizontal showsHorizontalScrollIndicator={false}
                style={styles.genreRow} contentContainerStyle={styles.genreContent}>
                {GENRES.map(g => (
                    <TouchableOpacity key={g}
                        style={[styles.chip, activeGenre === g && styles.chipActive]}
                        onPress={() => setActiveGenre(g)}>
                        <Text style={[styles.chipText, activeGenre === g && styles.chipTextActive]}>{g}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.heading}>{activeGenre === "Tất cả" ? "Phim thịnh hành" : activeGenre}</Text>

            <FlatList
                data={displayMovies}
                keyExtractor={item => String(item.id)}
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
                ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy phim nào</Text>}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container:       { flex: 1, backgroundColor: "#0a0a0a" },
    genreRow:        { height: 40, minHeight: 40, maxHeight: 40, flexGrow: 0, marginTop: 12, marginBottom: 16 }, 
    genreContent:    { paddingHorizontal: 16 }, 
    chip:            { height: "100%",paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: "#2a2a2a", backgroundColor: "#1c1c1c", marginRight: 10,justifyContent: "center", alignItems: "center" },
    chipActive:      { backgroundColor: "#e50914", borderColor: "#e50914" },
    chipText:        { color: "#b3b3b3", fontSize: 14, fontWeight: "500" },
    chipTextActive:  { color: "#fff", fontWeight: "bold" },
    heading:         { color: "#fff", fontSize: 18, fontWeight: "bold", paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
    list:            { paddingHorizontal: 16, paddingBottom: 24 },
    empty:           { color: "#6e6e6e", textAlign: "center", marginTop: 60, fontSize: 15 },
});

export default HomeScreen;