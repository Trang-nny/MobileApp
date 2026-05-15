import React, { useState, useEffect, useRef } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    ActivityIndicator, Dimensions, Linking
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons }                 from "@expo/vector-icons";
import { WebView }                  from "react-native-webview";
import { saveProgress }             from "../redux/actions";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Chuyển giây → "mm:ss"
function formatTime(secs = 0) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}

// Lấy YouTube video ID từ nhiều dạng URL
function getYoutubeId(url) {
    if (!url) return null;
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
    if (embedMatch) return embedMatch[1];
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return watchMatch[1];
    const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
    if (shortMatch) return shortMatch[1];
    return null;
}

// Fallback: tìm trailer trên YouTube
function fallbackSearchUrl(title, year) {
    const q = encodeURIComponent(`${title} ${year || ""} official trailer`);
    return `https://www.youtube.com/results?search_query=${q}`;
}

const VideoPlayerScreen = ({ route, navigation }) => {
    const { movie, startAt = 0 } = route.params;
    const dispatch  = useDispatch();
    const token     = useSelector(s => s.token);
    const [loading, setLoading] = useState(true);
    const [elapsed, setElapsed] = useState(startAt);
    const timerRef  = useRef(null);
    const savedRef  = useRef(startAt);

    const youtubeId = getYoutubeId(movie.trailer_url);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });

        // Đếm giây đã xem để lưu progress
        timerRef.current = setInterval(() => {
            setElapsed(prev => {
                const next = prev + 1;
                savedRef.current = next;
                return next;
            });
        }, 1000);

        return () => {
            clearInterval(timerRef.current);
            if (token && savedRef.current > 0) {
                dispatch(saveProgress(movie.id, savedRef.current, token));
            }
        };
    }, []);

    // Lưu mỗi 10 giây
    useEffect(() => {
        if (elapsed > 0 && elapsed % 10 === 0 && token) {
            dispatch(saveProgress(movie.id, elapsed, token));
        }
    }, [elapsed]);

    const embedHtml = youtubeId ? `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; background: #000; }
    body { background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; }
    iframe { width: 100vw; height: 56.25vw; border: none; }
  </style>
</head>
<body>
  <iframe
    src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&start=${startAt}"
    allow="autoplay; fullscreen"
    allowfullscreen>
  </iframe>
</body>
</html>` : null;

    return (
        <View style={styles.container}>
            {/* Video area */}
            <View style={styles.videoArea}>
                {embedHtml ? (
                    <>
                        <WebView
                            source={{ html: embedHtml }}
                            style={styles.webview}
                            allowsFullscreenVideo
                            javaScriptEnabled
                            mediaPlaybackRequiresUserAction={false}
                            onLoadEnd={() => setLoading(false)}
                        />
                        {loading && (
                            <View style={styles.loaderOverlay}>
                                <ActivityIndicator size="large" color="#e50914" />
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="film-outline" size={80} color="#2a2a2a" />
                        <Text style={styles.placeholderTitle}>{movie.title}</Text>
                        <Text style={styles.placeholderSub}>
                            Chưa có video.{"\n"}Bấm nút bên dưới để xem trailer trên YouTube.
                        </Text>
                        <TouchableOpacity
                            style={styles.ytBtn}
                            onPress={() => Linking.openURL(fallbackSearchUrl(movie.title, movie.year))}
                        >
                            <Ionicons name="logo-youtube" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.ytBtnText}>Tìm trên YouTube</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Nút back đè lên góc trái */}
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={26} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Thông tin phim */}
            <View style={styles.info}>
                <Text style={styles.infoTitle}>{movie.title}</Text>
                <Text style={styles.infoMeta}>
                    {movie.year}{movie.rating ? `  ·  ⭐ ${movie.rating}` : ""}
                    {movie.director ? `  ·  🎬 ${movie.director}` : ""}
                </Text>
                {startAt > 0 && (
                    <Text style={styles.resumeText}>▶ Tiếp tục từ {formatTime(startAt)}</Text>
                )}
                <Text style={styles.elapsedText}>⏱ Đã xem: {formatTime(elapsed)}</Text>

                {movie.cast_list ? (
                    <>
                        <Text style={styles.castLabel}>Diễn viên</Text>
                        <Text style={styles.castText}>{movie.cast_list}</Text>
                    </>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container:    { flex: 1, backgroundColor: "#0a0a0a" },
    videoArea:    { width: SCREEN_WIDTH, height: SCREEN_WIDTH * (9 / 16), backgroundColor: "#000" },
    webview:      { flex: 1, backgroundColor: "#000" },
    loaderOverlay:{ ...StyleSheet.absoluteFillObject, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
    backBtn:      { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 20, padding: 6 },
    placeholder:  { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
    placeholderTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 16, textAlign: "center" },
    placeholderSub:   { color: "#555", fontSize: 13, marginTop: 10, textAlign: "center", lineHeight: 20 },
    ytBtn:        { flexDirection: "row", alignItems: "center", marginTop: 20, backgroundColor: "#cc0000", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    ytBtnText:    { color: "#fff", fontWeight: "bold", fontSize: 14 },
    info:         { flex: 1, padding: 16 },
    infoTitle:    { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 6 },
    infoMeta:     { color: "#b3b3b3", fontSize: 13, marginBottom: 4 },
    resumeText:   { color: "#e50914", fontSize: 13, fontWeight: "bold", marginTop: 6 },
    elapsedText:  { color: "#555", fontSize: 12, marginTop: 4 },
    castLabel:    { color: "#fff", fontSize: 15, fontWeight: "bold", marginTop: 16, marginBottom: 4 },
    castText:     { color: "#b3b3b3", fontSize: 13, lineHeight: 20 },
});

export default VideoPlayerScreen;