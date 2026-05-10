import React, { useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { fetchFavorites, removeFavorite } from "../redux/actions";
import MovieCard      from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";

const FavoritesScreen = ({ navigation }) => {
    const dispatch         = useDispatch();
    const token            = useSelector(s => s.token);
    const favoriteIds      = useSelector(s => s.favoriteIds);
    const movies           = useSelector(s => s.movies);
    const favoritesLoading = useSelector(s => s.favoritesLoading);

    const favoriteMovies = movies.filter(m => favoriteIds.includes(Number(m.id)));

    useEffect(() => {
        if (token) dispatch(fetchFavorites(token));
    }, [token]);

    // Chưa đăng nhập
    if (!token) {
        return (
            <SafeAreaView style={styles.center}>
                <Ionicons name="heart-dislike-outline" size={60} color="#2a2a2a" />
                <Text style={styles.emptyTitle}>Chưa đăng nhập</Text>
                <Text style={styles.emptyText}>Đăng nhập để lưu phim yêu thích</Text>
                <TouchableOpacity
                    style={styles.loginBtn}
                    onPress={() => navigation.navigate("Login")}
                >
                    <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (favoritesLoading) return <LoadingSpinner />;

    // Danh sách trống
    if (favoriteIds.length === 0) {
        return (
            <SafeAreaView style={styles.center}>
                <Ionicons name="heart-outline" size={60} color="#2a2a2a" />
                <Text style={styles.emptyTitle}>Danh sách trống</Text>
                <Text style={styles.emptyText}>Nhấn ♥ trên bất kỳ phim nào để lưu</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Phim yêu thích ({favoriteIds.length})</Text>
            <FlatList
                data={favoriteIds}
                keyExtractor={id => String(id)}
                contentContainerStyle={styles.list}
                renderItem={({ item: id }) => {
                    const movie = favoriteMovies.find(m => Number(m.id) === id);
                    if (!movie) return null;
                    return (
                        <MovieCard
                            title={movie.title}
                            genre={movie.genres ? movie.genres.join(", ") : movie.genre}
                            year={movie.year}
                            rating={movie.rating}
                            image={movie.image}
                            poster_url={movie.poster_url}
                            isFavorite
                            onPress={() => navigation.navigate("MovieDetail", { movie })}
                            onToggleFavorite={() => dispatch(removeFavorite(id, token))}
                        />
                    );
                }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0a0a0a",
    },
    center: {
        flex: 1,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    heading: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        padding: 16,
        paddingBottom: 8,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    emptyTitle: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 16,
    },
    emptyText: {
        color: "#6e6e6e",
        fontSize: 14,
        textAlign: "center",
        marginTop: 8,
    },
    loginBtn: {
        marginTop: 20,
        backgroundColor: "#e50914",
        borderRadius: 8,
        paddingHorizontal: 28,
        paddingVertical: 12,
    },
    loginBtnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 15,
    },
});

export default FavoritesScreen;