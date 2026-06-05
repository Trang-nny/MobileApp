import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    View, Text, FlatList, StyleSheet,
    TouchableOpacity, ScrollView, Image,
    Animated, useWindowDimensions,
} from "react-native";
import { SafeAreaView }            from "react-native-safe-area-context";
import { LinearGradient }          from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons }                from "@expo/vector-icons";
import { fetchPopularMovies, fetchMovies, addFavorite, removeFavorite } from "../redux/actions";
import { API }                     from "../redux/actions";
import { useFocusEffect }             from "@react-navigation/native";
import LoadingSpinner              from "../components/LoadingSpinner";

const ASSETS_MAP = {
    "Avengers: Endgame":       require("../assets/Avenger-Endgame.jpg"),
    "Spider-Man: No Way Home": require("../assets/Spiderman_No_Way_Home.jpg"),
    "Titanic":                 require("../assets/Titanic.jpg"),
    "Zootopia":                require("../assets/Zootopia.jpg"),
    "Paddington in Peru":      require("../assets/Paddington-Peru.jpg"),
};
const TMDB = "https://image.tmdb.org";

function normPoster(url) {
    if (!url) return null;
    url = String(url).trim();
    if (url.startsWith("http://") || url.startsWith("https://"))
        return url.replace(/\/t\/p\/(w\d+|original)\//, "/t/p/w500/");
    if (url.startsWith("/t/p/")) return TMDB + url.replace(/\/t\/p\/(w\d+|original)\//, "/t/p/w500/");
    if (url.startsWith("/"))    return `${TMDB}/t/p/w500${url}`;
    return `${TMDB}/t/p/w500/${url}`;
}

function resolveImg(movie) {
    if (!movie) return null;
    if (ASSETS_MAP[movie.title]) return ASSETS_MAP[movie.title];
    const p = normPoster(movie.poster_url);
    if (p) return { uri: p };
    return null;
}

const AutoBanner = ({ movies, navigation, token, favoriteIds, dispatch, width, bannerHeight }) => {
    const [idx, setIdx]   = useState(0);
    const fadeAnim        = useRef(new Animated.Value(1)).current;
    const timerRef        = useRef(null);
    const TOP5            = movies.slice(0, 5);

    const goTo = (next) => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        ]).start();
        setIdx(next);
    };

    useEffect(() => {
        if (TOP5.length < 2) return;
        timerRef.current = setInterval(() => {
            setIdx(prev => {
                const next = (prev + 1) % TOP5.length;
                Animated.sequence([
                    Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
                    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                ]).start();
                return next;
            });
        }, 4000);
        return () => clearInterval(timerRef.current);
    }, [TOP5.length]);

    if (!TOP5.length) return null;

    const movie  = TOP5[idx];
    const imgSrc = resolveImg(movie);
    const isFav  = favoriteIds.includes(Number(movie.id));
    const genres = movie.genres || [];

    const handleFav = () => {
        if (!token) { navigation.navigate("Login"); return; }
        if (isFav)  dispatch(removeFavorite(Number(movie.id), token));
        else        dispatch(addFavorite(Number(movie.id), token));
    };

    return (
        <View style={[banner.wrap, { width, height: bannerHeight }]}>
            {/* Background image */}
            <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}>
                {imgSrc && (
                    <Image source={imgSrc} style={banner.bg} resizeMode="cover" />
                )}
                <LinearGradient
                    colors={["rgba(10,10,10,0.1)", "rgba(10,10,10,0.5)", "#0a0a0a"]}
                    style={StyleSheet.absoluteFillObject}
                />
            </Animated.View>

            {/* Nội dung */}
            <Animated.View style={[banner.info, { opacity: fadeAnim }]}>
                {/* Thể loại */}
                <View style={banner.genreRow}>
                    {genres.slice(0, 3).map((g, i) => (
                        <View key={i} style={banner.genrePill}>
                            <Text style={banner.genreText}>{g}</Text>
                        </View>
                    ))}
                </View>

                <Text style={banner.title} numberOfLines={2}>{movie.title}</Text>

                <Text style={banner.meta}>
                    {movie.year}{"  ·  "}
                    <Text style={{ color: "#f5a623" }}>⭐ {movie.rating}</Text>
                    {movie.director ? `  ·  ${movie.director}` : ""}
                </Text>

                <View style={banner.btnRow}>
                    <TouchableOpacity
                        style={banner.watchBtn}
                        onPress={() => navigation.navigate("MovieDetail", { movie })}
                    >
                        <Ionicons name="play" size={18} color="#000" />
                        <Text style={banner.watchText}>Xem ngay</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={banner.favBtn} onPress={handleFav}>
                        <Ionicons
                            name={isFav ? "heart" : "heart-outline"}
                            size={22}
                            color={isFav ? "#e50914" : "#fff"}
                        />
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Dots chỉ vị trí */}
            <View style={banner.dots}>
                {TOP5.map((_, i) => (
                    <TouchableOpacity key={i} onPress={() => goTo(i)}>
                        <View style={[banner.dot, i === idx && banner.dotActive]} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const banner = StyleSheet.create({
    wrap:      { position: "relative", backgroundColor: "#000" },
    bg:        { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
    info:      { position: "absolute", bottom: 36, left: 16, right: 16 },
    genreRow:  { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
    genrePill: { backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
    genreText: { color: "#fff", fontSize: 11, fontWeight: "600" },
    title:     { color: "#fff", fontSize: 28, fontWeight: "900", letterSpacing: -0.5, marginBottom: 6 },
    meta:      { color: "#b3b3b3", fontSize: 13, marginBottom: 16 },
    btnRow:    { flexDirection: "row", alignItems: "center", gap: 12 },
    watchBtn:  { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 22, paddingVertical: 11, gap: 7 },
    watchText: { color: "#000", fontWeight: "900", fontSize: 15 },
    favBtn:    { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
    dots:      { position: "absolute", bottom: 14, right: 16, flexDirection: "row", gap: 6 },
    dot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.4)" },
    dotActive: { backgroundColor: "#e50914", width: 18 },
});

//PosterItem (poster nhỏ hàng ngang)
const POSTER_ITEM_W = 120;
const POSTER_ITEM_H = 175;

const PosterItem = ({ movie, onPress }) => {
    const src = resolveImg(movie);
    return (
        <TouchableOpacity style={poster.wrap} onPress={onPress} activeOpacity={0.85}>
            {src ? (
                <Image source={src} style={poster.img} resizeMode="cover" />
            ) : (
                <View style={[poster.img, poster.noImg]}>
                    <Ionicons name="film-outline" size={28} color="#333" />
                </View>
            )}
            {movie.rating ? (
                <View style={poster.badge}>
                    <Text style={poster.badgeText}>⭐ {movie.rating}</Text>
                </View>
            ) : null}
            <Text style={poster.title} numberOfLines={1}>{movie.title}</Text>
            <Text style={poster.year}>{movie.year}</Text>
        </TouchableOpacity>
    );
};

const poster = StyleSheet.create({
    wrap:      { width: POSTER_ITEM_W, marginRight: 10 },
    img:       { width: POSTER_ITEM_W, height: POSTER_ITEM_H, borderRadius: 8, backgroundColor: "#1c1c1c" },
    noImg:     { justifyContent: "center", alignItems: "center" },
    badge:     { position: "absolute", top: 6, right: 6, backgroundColor: "rgba(0,0,0,0.75)", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
    badgeText: { color: "#f5a623", fontSize: 10, fontWeight: "bold" },
    title:     { color: "#fff", fontSize: 12, fontWeight: "600", marginTop: 6 },
    year:      { color: "#777", fontSize: 11, marginTop: 2 },
});

// HomeScreen
const HomeScreen = ({ navigation }) => {
    const { width, height } = useWindowDimensions();
    const BANNER_HEIGHT = height * 0.55;
    const GRID_W = (width - 16 * 2 - 8 * 2) / 3;
    const GRID_H = GRID_W * 1.5;

    const dispatch      = useDispatch();
    const apiMovies     = useSelector(s => s.movies);
    const popularMovies = useSelector(s => s.popularMovies);
    const favoriteIds   = useSelector(s => s.favoriteIds);
    const moviesLoading = useSelector(s => s.moviesLoading);
    const token         = useSelector(s => s.token);

    const [search,      setSearch]      = useState("");
    const [activeGenre, setActiveGenre] = useState({ label: "Tất cả", id: "" });
    const [genres,      setGenres]      = useState([]);

    // Reload phim + thể loại mỗi khi màn hình được focus lại
    // (ví dụ: admin vừa thêm/xóa phim rồi quay về Home)
    useFocusEffect(
        useCallback(() => {
            dispatch(fetchPopularMovies());
            fetch(`${API}/genres`)
                .then(r => r.json())
                .then(data => { if (Array.isArray(data)) setGenres(data); })
                .catch(() => {});
        }, [])
    );

    useEffect(() => {
        const params = {};
        if (search)         params.search   = search;
        if (activeGenre.id) params.genre_id = activeGenre.id;
        const t = setTimeout(() => dispatch(fetchMovies(params)), 400);
        return () => clearTimeout(t);
    }, [search, activeGenre]);

    const baseMovies    = apiMovies.length > 0     ? apiMovies     : [];
    const bannerMovies  = popularMovies.length > 0 ? popularMovies : baseMovies;
    const isSearching   = !!(search || activeGenre.id);

    const sectionLabel  = search
        ? `Kết quả: "${search}"`
        : activeGenre.id
            ? activeGenre.label
            : "Phim thịnh hành";

    if (moviesLoading && baseMovies.length === 0 && bannerMovies.length === 0)
        return <LoadingSpinner />;

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* ── Auto-sliding Banner ── */}
                {!isSearching && (
                    <AutoBanner
                        movies={bannerMovies}
                        navigation={navigation}
                        token={token}
                        favoriteIds={favoriteIds}
                        dispatch={dispatch}
                        width={width}
                        bannerHeight={BANNER_HEIGHT}
                    />
                )}

                {/* ── Search + Genre chips ── */}
                <View style={styles.filterWrap}>
                    <SearchBar value={search} onChangeText={setSearch} />
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.genreContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        <TouchableOpacity
                            style={[styles.chip, activeGenre.id === "" && styles.chipActive]}
                            onPress={() => setActiveGenre({ label: "Tất cả", id: "" })}
                        >
                            <Text style={[styles.chipText, activeGenre.id === "" && styles.chipActiveText]}>Tất cả</Text>
                        </TouchableOpacity>
                        {genres.map(g => (
                            <TouchableOpacity
                                key={g.id}
                                style={[styles.chip, activeGenre.id === g.id && styles.chipActive]}
                                onPress={() => setActiveGenre({ label: g.name, id: g.id })}
                            >
                                <Text style={[styles.chipText, activeGenre.id === g.id && styles.chipActiveText]}>{g.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* ── Section title ── */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{sectionLabel}</Text>
                </View>

                {/* ── Danh sách phim hàng ngang cuộn ── */}
                {!isSearching ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.hList}
                    >
                        {baseMovies.map(item => (
                            <PosterItem
                                key={String(item.id)}
                                movie={item}
                                onPress={() => navigation.navigate("MovieDetail", { movie: item })}
                            />
                        ))}
                    </ScrollView>
                ) : (
                    /* Khi tìm kiếm / lọc thể loại → grid 3 cột */
                    <View style={[styles.gridWrap]}>
                        {baseMovies.length === 0 ? (
                            <Text style={styles.empty}>Không tìm thấy phim nào</Text>
                        ) : (
                            baseMovies.map(item => (
                                <TouchableOpacity
                                    key={String(item.id)}
                                    style={[styles.gridItem, { width: GRID_W }]}
                                    onPress={() => navigation.navigate("MovieDetail", { movie: item })}
                                    activeOpacity={0.85}
                                >
                                    {resolveImg(item) ? (
                                        <Image source={resolveImg(item)} style={[styles.gridImg, { width: GRID_W, height: GRID_H }]} resizeMode="cover" />
                                    ) : (
                                        <View style={[styles.gridImg, styles.gridNoImg, { width: GRID_W, height: GRID_H }]}>
                                            <Ionicons name="film-outline" size={28} color="#333" />
                                        </View>
                                    )}
                                    {item.rating && (
                                        <View style={styles.gridBadge}>
                                            <Text style={styles.gridBadgeText}>⭐ {item.rating}</Text>
                                        </View>
                                    )}
                                    <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
                                    <Text style={styles.gridYear}>{item.year}</Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container:       { flex: 1, backgroundColor: "#0a0a0a" },
    filterWrap:      { paddingTop: 10 },
    genreContent:    { paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
    chip:            { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: "#2a2a2a", backgroundColor: "#1c1c1c", marginRight: 8 },
    chipActive:      { backgroundColor: "#e50914", borderColor: "#e50914" },
    chipText:        { color: "#b3b3b3", fontSize: 13 },
    chipActiveText:  { color: "#fff", fontWeight: "bold" },
    sectionHeader:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
    sectionTitle:    { color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: -0.3 },
    hList:           { paddingHorizontal: 16, paddingBottom: 8 },
    gridWrap:        { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8 },
    gridItem:        { marginBottom: 14 },
    gridImg:         { borderRadius: 8, backgroundColor: "#1c1c1c" },
    gridNoImg:       { justifyContent: "center", alignItems: "center" },
    gridBadge:       { position: "absolute", top: 6, right: 5, backgroundColor: "rgba(0,0,0,0.75)", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
    gridBadgeText:   { color: "#f5a623", fontSize: 10, fontWeight: "bold" },
    gridTitle:       { color: "#fff", fontSize: 12, fontWeight: "600", marginTop: 5 },
    gridYear:        { color: "#777", fontSize: 11, marginTop: 2 },
    empty:           { color: "#6e6e6e", textAlign: "center", width: "100%", marginTop: 40, fontSize: 15 },
});

export default HomeScreen;