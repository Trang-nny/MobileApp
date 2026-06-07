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
    const favoriteMovies   = useSelector(s => s.favoriteMovies);
    const favoritesLoading = useSelector(s => s.favoritesLoading);

    useEffect(() => {
        if (token) dispatch(fetchFavorites(token));
    }, [token]);

    if (!token) {
        return (
            <SafeAreaView style={styles.center}>
                <View style={styles.emptyIcon}>
                    <Ionicons name="heart-outline" size={40} color="#e50914" />
                </View>
                <Text style={styles.emptyTitle}>Chưa đăng nhập</Text>
                <Text style={styles.emptyText}>Đăng nhập để lưu những bộ phim yêu thích</Text>
                <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (favoritesLoading) return <LoadingSpinner />;

    if (favoriteIds.length === 0) {
        return (
            <SafeAreaView style={styles.center}>
                <View style={styles.emptyIcon}>
                    <Ionicons name="heart-outline" size={40} color="#e50914" />
                </View>
                <Text style={styles.emptyTitle}>Danh sách trống</Text>
                <Text style={styles.emptyText}>
                    Nhấn biểu tượng ♥ trên bất kỳ phim nào để lưu vào đây
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>Yêu thích ({favoriteIds.length})</Text>
            <FlatList
                data={favoriteIds}
                keyExtractor={id => String(id)}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: id }) => {
                    const movie = favoriteMovies.find(m => Number(m.id) === id);
                    if (!movie) return null;
                    return (
                        <MovieCard
                            variant="row"
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
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container:        { flex: 1, backgroundColor: "#0a0a0a" },
    center:           { flex: 1, backgroundColor: "#0a0a0a", justifyContent: "center", alignItems: "center", padding: 32 },
    heading:          { color: "#fff", fontSize: 18, fontWeight: "bold", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10 },
    list:             { paddingHorizontal: 16, paddingBottom: 32 },
    emptyIcon:        { width: 80, height: 80, borderRadius: 40, backgroundColor: "#1c1c1c", justifyContent: "center", alignItems: "center", marginBottom: 20 },
    emptyTitle:       { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 8 },
    emptyText:        { color: "#6e6e6e", fontSize: 14, textAlign: "center", lineHeight: 20 },
    loginBtn:         { marginTop: 24, backgroundColor: "#e50914", borderRadius: 8, paddingHorizontal: 32, paddingVertical: 14 },
    loginBtnText:     { color: "#fff", fontWeight: "bold", fontSize: 15 },
});

export default FavoritesScreen;