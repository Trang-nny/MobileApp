import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    View, Text, StyleSheet,
    TouchableOpacity, ScrollView, Image,
    Animated, useWindowDimensions,
} from "react-native";
import { SafeAreaView }             from "react-native-safe-area-context";
import { LinearGradient }           from "expo-linear-gradient";
import { useDispatch, useSelector }  from "react-redux";
import { Ionicons }                 from "@expo/vector-icons";
import { useFocusEffect }           from "@react-navigation/native";
import {
    fetchPopularMovies, fetchMovies,
    addFavorite, removeFavorite,
} from "../redux/actions";
import { API }           from "../redux/actions";
import LoadingSpinner    from "../components/LoadingSpinner";
import SearchBar         from "../components/SearchBar";

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
    const p = normPoster(movie.poster_url);
    if (p) return { uri: p };
    return null;
}

// Banner tự động chuyển (chỉ hiện ở chế độ Home)
const AutoBanner = ({ movies, navigation, token, favoriteIds, dispatch, width, bannerHeight }) => {
    const [idx, setIdx] = useState(0);
    const fadeAnim      = useRef(new Animated.Value(1)).current;
    const timerRef      = useRef(null);
    const TOP5          = movies.slice(0, 5);

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
            <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}>
                {imgSrc && <Image source={imgSrc} style={banner.bg} resizeMode="cover" />}
                <LinearGradient
                    colors={["rgba(10,10,10,0.1)", "rgba(10,10,10,0.5)", "#0a0a0a"]}
                    style={StyleSheet.absoluteFillObject}
                />
            </Animated.View>

            <Animated.View style={[banner.info, { opacity: fadeAnim }]}>
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

// Poster item hàng ngang (chế độ Home)
const POSTER_W = 120;
const POSTER_H = 175;

const PosterItem = ({ movie, onPress }) => {
    const src = resolveImg(movie);
    return (
        <TouchableOpacity style={ps.wrap} onPress={onPress} activeOpacity={0.85}>
            {src ? (
                <Image source={src} style={ps.img} resizeMode="cover" />
            ) : (
                <View style={[ps.img, ps.noImg]}>
                    <Ionicons name="film-outline" size={28} color="#333" />
                </View>
            )}
            {movie.rating ? (
                <View style={ps.badge}>
                    <Text style={ps.badgeText}>⭐ {movie.rating}</Text>
                </View>
            ) : null}
            <Text style={ps.title} numberOfLines={1}>{movie.title}</Text>
            <Text style={ps.year}>{movie.year}</Text>
        </TouchableOpacity>
    );
};

const ps = StyleSheet.create({
    wrap:      { width: POSTER_W, marginRight: 10 },
    img:       { width: POSTER_W, height: POSTER_H, borderRadius: 8, backgroundColor: "#1c1c1c" },
    noImg:     { justifyContent: "center", alignItems: "center" },
    badge:     { position: "absolute", top: 6, right: 6, backgroundColor: "rgba(0,0,0,0.75)", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
    badgeText: { color: "#f5a623", fontSize: 10, fontWeight: "bold" },
    title:     { color: "#fff", fontSize: 12, fontWeight: "600", marginTop: 6 },
    year:      { color: "#777", fontSize: 11, marginTop: 2 },
});

// HomeScreen chính
const HomeScreen = ({ navigation }) => {
    const { width, height } = useWindowDimensions();
    const BANNER_H = height * 0.55;
    
    const GRID_W   = (width - 32 - 16) / 3;   
    const GRID_H   = GRID_W * 1.5;

    const dispatch      = useDispatch();
    const apiMovies     = useSelector(s => s.movies);
    const popularMovies = useSelector(s => s.popularMovies);
    const favoriteIds   = useSelector(s => s.favoriteIds);
    const moviesLoading = useSelector(s => s.moviesLoading);
    const token         = useSelector(s => s.token);

    const [search,      setSearch]      = useState("");
    const [activeGenre, setActiveGenre] = useState(null);
    const [genres,      setGenres]      = useState([]);
    const [mode,        setMode]        = useState("home");

    // Load dữ liệu khi mount — chạy ngay cả trên web (useFocusEffect không fire trên web)
    useEffect(() => {
        dispatch(fetchPopularMovies());
        dispatch(fetchMovies({}));
        fetch(`${API}/genres`)
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setGenres(data); })
            .catch(() => {});
    }, []);

    // Nhấn icon Trang Chủ ở tab bar → reset hoàn toàn về home (native)
    useFocusEffect(
        useCallback(() => {
            dispatch(fetchPopularMovies());
            dispatch(fetchMovies({}));
            fetch(`${API}/genres`)
                .then(r => r.json())
                .then(data => { if (Array.isArray(data)) setGenres(data); })
                .catch(() => {});

            setMode("home");
            setSearch("");
            setActiveGenre(null);
        }, [])
    );

    // Khi đang ở màn hình Home (đã focus) mà nhấn tab bar lần nữa → cũng reset về home
    useEffect(() => {
        const unsubscribe = navigation.addListener("tabPress", () => {
            setMode("home");
            setSearch("");
            setActiveGenre(null);
        });
        return unsubscribe;
    }, [navigation]);

    // Fetch phim theo filter (chỉ trong chế độ browse)
    useEffect(() => {
        if (mode !== "browse") return;
        const params = {};
        if (search)          params.search    = search;
        if (activeGenre?.id) params.genre_id = activeGenre.id;
        const t = setTimeout(() => dispatch(fetchMovies(params)), 400);
        return () => clearTimeout(t);
    }, [search, activeGenre, mode]);

    const baseMovies   = apiMovies.length > 0     ? apiMovies     : [];
    const bannerMovies = popularMovies.length > 0 ? popularMovies : baseMovies;

    const sectionLabel = search
        ? `Kết quả: "${search}"`
        : activeGenre
            ? activeGenre.label
            : "Tất cả phim";

    if (moviesLoading && baseMovies.length === 0 && bannerMovies.length === 0)
        return <LoadingSpinner />;

    // CHẾ ĐỘ HOME — banner + hàng ngang
    if (mode === "home") {
        return (
            <SafeAreaView style={styles.container} edges={["top"]}>
                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                    <AutoBanner
                        movies={bannerMovies}
                        navigation={navigation}
                        token={token}
                        favoriteIds={favoriteIds}
                        dispatch={dispatch}
                        width={width}
                        bannerHeight={BANNER_H}
                    />

                    <View style={styles.homeSearchWrap}>
                        <TouchableOpacity
                            style={styles.homeSearchFake}
                            onPress={() => {
                                setActiveGenre(null);
                                setSearch("");
                                setMode("browse");
                            }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="search-outline" size={18} color="#555" />
                            <Text style={styles.homeSearchPlaceholder}>Tìm kiếm phim...</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.genreScrollContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={styles.genreContent}
                        >
                            <TouchableOpacity
                                style={styles.chip}
                                onPress={() => {
                                    setActiveGenre(null);
                                    setSearch("");
                                    setMode("browse");
                                }}
                            >
                                <Text style={styles.chipText}>Tất cả</Text>
                            </TouchableOpacity>
                            {genres.map(g => (
                                <TouchableOpacity
                                    key={g.id}
                                    style={styles.chip}
                                    onPress={() => {
                                        setActiveGenre({ label: g.name, id: g.id });
                                        setSearch("");
                                        setMode("browse");
                                    }}
                                >
                                    <Text style={styles.chipText}>{g.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Phim thịnh hành</Text>
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.hList}
                    >
                        {popularMovies.map(item => (
                            <PosterItem
                                key={String(item.id)}
                                movie={item}
                                onPress={() => navigation.navigate("MovieDetail", { movie: item })}
                            />
                        ))}
                    </ScrollView>

                    <View style={{ height: 32 }} />
                </ScrollView>
            </SafeAreaView>
        );
    }

    // CHẾ ĐỘ BROWSE — search + chip + grid
    return (
        <SafeAreaView style={styles.container} edges={["top"]}>

            {/* Search bar thật (có thể gõ) */}
            <View style={styles.browseHeader}>
                <SearchBar
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Chip thể loại với trạng thái active */}
            <View style={styles.genreScrollContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.genreContent}
                >
                    <TouchableOpacity
                        style={[styles.chip, !activeGenre && !search && styles.chipActive]}
                        onPress={() => { setActiveGenre(null); setSearch(""); }}
                    >
                        <Text style={[styles.chipText, !activeGenre && !search && styles.chipActiveText]}>
                            Tất cả
                        </Text>
                    </TouchableOpacity>
                    {genres.map(g => (
                        <TouchableOpacity
                            key={g.id}
                            style={[styles.chip, activeGenre?.id === g.id && styles.chipActive]}
                            onPress={() => { setActiveGenre({ label: g.name, id: g.id }); setSearch(""); }}
                        >
                            <Text style={[styles.chipText, activeGenre?.id === g.id && styles.chipActiveText]}>
                                {g.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Section title */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{sectionLabel}</Text>
            </View>

            {/* Grid phim cuộn */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.gridScroll}
            >
                {moviesLoading ? (
                    <LoadingSpinner />
                ) : baseMovies.length === 0 ? (
                    <Text style={styles.empty}>Không tìm thấy phim nào</Text>
                ) : (
                    <View style={styles.gridWrap}>
                        {baseMovies.map(item => (
                            <TouchableOpacity
                                key={String(item.id)}
                                style={[styles.gridItem, { width: GRID_W }]}
                                onPress={() => navigation.navigate("MovieDetail", { movie: item })}
                                activeOpacity={0.85}
                            >
                                {resolveImg(item) ? (
                                    <Image
                                        source={resolveImg(item)}
                                        style={[styles.gridImg, { width: GRID_W, height: GRID_H }]}
                                        resizeMode="cover"
                                    />
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
                        ))}
                    </View>
                )}
                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container:             { flex: 1, backgroundColor: "#0a0a0a" },
    homeSearchWrap:        { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 },
    homeSearchFake:        { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#1c1c1c", borderRadius: 10, borderWidth: 1, borderColor: "#2a2a2a", paddingHorizontal: 14, height: 46, },
    homeSearchPlaceholder: { color: "#555", fontSize: 15 },
    browseHeader:          { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 4 },
    genreScrollContainer:  { height: 50, justifyContent: "center" },
    genreContent:          { flexDirection: "row", alignItems: "center", paddingHorizontal: 14 },
    chip:                  { height: 34, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderColor: "#2a2a2a", backgroundColor: "#1c1c1c", marginRight: 8, justifyContent: "center", alignItems: "center", },
    chipActive:            { backgroundColor: "#e50914", borderColor: "#e50914" },
    chipText:              { color: "#b3b3b3", fontSize: 13 },
    chipActiveText:        { color: "#fff", fontWeight: "bold" },
    sectionHeader:         { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
    sectionTitle:          { color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: -0.3 },
    hList:                 { paddingHorizontal: 16, paddingBottom: 8 },
    gridScroll:            { paddingHorizontal: 16 },
    gridWrap:              { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", gap: 8 },
    gridItem:              { marginBottom: 14 },
    gridImg:               { borderRadius: 8, backgroundColor: "#1c1c1c" },
    gridNoImg:             { justifyContent: "center", alignItems: "center" },
    gridBadge:             { position: "absolute", top: 6, right: 5, backgroundColor: "rgba(0,0,0,0.75)", paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
    gridBadgeText:         { color: "#f5a623", fontSize: 10, fontWeight: "bold" },
    gridTitle:             { color: "#fff", fontSize: 12, fontWeight: "600", marginTop: 5 },
    gridYear:              { color: "#777", fontSize: 11, marginTop: 2 },
    empty:                 { color: "#6e6e6e", textAlign: "center", marginTop: 60, fontSize: 15 },
});

export default HomeScreen;