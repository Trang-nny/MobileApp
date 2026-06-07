import React, { useState, useEffect, useRef, Suspense } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    ActivityIndicator, Linking, StatusBar, Platform, useWindowDimensions
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { Ionicons }                 from "@expo/vector-icons";
import { saveProgress }             from "../redux/actions";

// Khởi tạo Lazy Load cho thư viện Native bảo vệ Web không bị sập
const MobileYoutubePlayer = Platform.OS !== "web" 
    ? React.lazy(() => import("react-native-youtube-iframe"))
    : null;

// Định dạng giây → "mm:ss"
function formatTime(secs = 0) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}

// Hàm tách ID video từ database
function getYoutubeId(url) {
    if (!url) return null;
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&/]+)/);
    if (embedMatch) return embedMatch[1];
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) return watchMatch[1];
    const shortMatch = url.match(/youtu\.be\/([^?&/]+)/);
    if (shortMatch) return shortMatch[1];
    return null;
}

function fallbackSearchUrl(title, year) {
    const q = encodeURIComponent(`${title} ${year || ""} official trailer`);
    return `https://www.youtube.com/results?search_query=${q}`;
}

const VideoPlayerScreen = ({ route, navigation }) => {
    const { width: windowWidth } = useWindowDimensions();
    const { movie, startAt = 0 } = route.params;
    const dispatch  = useDispatch();
    const token     = useSelector(s => s.token);
    
    const [loading, setLoading] = useState(true);
    const [elapsed, setElapsed] = useState(startAt); 
    const [isPlaying, setIsPlaying] = useState(false); 

    const playerRef = useRef(null); 
    const iframeRef = useRef(null); 
    const timerRef  = useRef(null);
    const savedRef  = useRef(startAt);

    const youtubeId = getYoutubeId(movie.trailer_url);

    // Bộ đếm giây nâng cấp: Quản lý trạng thái thông minh cho cả Web và Android
    useEffect(() => {
        navigation.setOptions({ headerShown: false });

        timerRef.current = setInterval(async () => {
            let currentIsPlaying = isPlaying;

            // LOGIC ĐỌC TRẠNG THÁI TRÊN WEB (Vượt rào cản bảo mật trình duyệt)
            if (Platform.OS === "web" && iframeRef.current) {
                try {
                    // Đọc trực tiếp tiêu đề trang HTML bên trong iframe phát phim
                    const iframeTitle = iframeRef.current.contentDocument?.title || iframeRef.current.title;
                    if (iframeTitle === "playing") {
                        currentIsPlaying = true;
                        setIsPlaying(true);
                    } else if (iframeTitle === "paused" || iframeTitle === "ended") {
                        currentIsPlaying = false;
                        setIsPlaying(false);
                    }
                } catch (e) {
                    // Kháng lỗi Cross-Origin nếu có
                }
            }

            if (!currentIsPlaying) return; // Nếu đang dừng phim -> Đóng băng bộ đếm lập tức

            let currentTime = savedRef.current;

            if (Platform.OS === "web") {
                currentTime = savedRef.current + 1;
            } else {
                // Trên Android: Lấy trực tiếp từ hàm lõi cứng ứng dụng
                if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
                    try {
                        const time = await playerRef.current.getCurrentTime();
                        if (time !== undefined && time !== null) {
                            currentTime = Math.floor(time);
                        }
                    } catch (e) {
                        currentTime = savedRef.current + 1;
                    }
                } else {
                    currentTime = savedRef.current + 1;
                }
            }

            setElapsed(currentTime);
            savedRef.current = currentTime;

            // Đồng bộ lên hệ thống mỗi 10 giây
            if (currentTime > 0 && currentTime % 10 === 0 && token) {
                dispatch(saveProgress(movie.id, currentTime, token));
            }
        }, 1000);

        return () => {
            clearInterval(timerRef.current);
            if (token && savedRef.current > 0) {
                dispatch(saveProgress(movie.id, savedRef.current, token));
            }
        };
    }, [isPlaying, token, movie.id]);

    // Trạng thái đổi dành riêng cho Android Player
    const onStateChange = (state) => {
        if (state === "playing") {
            setIsPlaying(true);
        } else if (state === "paused" || state === "ended" || state === "buffering") {
            setIsPlaying(false);
        }
    };

    // TRANG HTML NỘI BỘ TRÊN WEB: Tích hợp sẵn bộ điều khiển API chính thức của Google
    const getWebHtmlContent = () => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>paused</title>
                <style>
                    body, html { margin: 0; padding: 0; width: 100%; height: 100%; backgroundColor: #000; overflow: hidden; }
                    #player { width: 100%; height: 100%; }
                </style>
                <script src="https://www.youtube.com/iframe_api"></script>
            </head>
            <body>
                <div id="player"></div>
                <script>
                    var player;
                    function onYouTubeIframeAPIReady() {
                        player = new YT.Player('player', {
                            videoId: '${youtubeId}',
                            playerVars: { 'autoplay': 1, 'start': ${startAt}, 'rel': 0, 'modestbranding': 1, 'controls': 1 },
                            events: {
                                'onStateChange': onPlayerStateChange,
                                'onReady': function() { window.parent.postMessage('ready', '*'); }
                            }
                        });
                    }
                    function onPlayerStateChange(event) {
                        // 1 = Playing, 2 = Paused, 0 = Ended
                        if (event.data == 1) {
                            document.title = "playing";
                        } else if (event.data == 2) {
                            document.title = "paused";
                        } else if (event.data == 0) {
                            document.title = "ended";
                        }
                    }
                </script>
            </body>
            </html>
        `;
    };

    const videoHeight = windowWidth * (9 / 16);

    const renderVideoPlayer = () => {
        if (Platform.OS === "web") {
            return (
                <iframe
                    ref={iframeRef}
                    title="paused"
                    srcDoc={getWebHtmlContent()} // Bơm trực tiếp trang HTML quản lý lõi cứng vào iframe
                    style={{ width: "100%", height: "100%", border: "none", background: "#000" }}
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    onLoad={() => {
                        setLoading(false);
                        setIsPlaying(true);
                    }}
                />
            );
        } else {
            try {
                const MobilePlayer = MobileYoutubePlayer;
                return (
                    <Suspense fallback={<ActivityIndicator size="large" color="#e50914" />}>
                        {MobilePlayer && (
                            <MobilePlayer
                                ref={playerRef}
                                height={videoHeight}
                                play={true}
                                videoId={youtubeId}
                                startTime={startAt}
                                onChangeState={onStateChange} 
                                webViewProps={{
                                    androidLayerType: "hardware",
                                    domStorageEnabled: true,
                                }}
                                onReady={() => setLoading(false)}
                            />
                        )}
                    </Suspense>
                );
            } catch (error) {
                return null;
            }
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => {
                    setIsPlaying(false); 
                    navigation.goBack();
                }}>
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                    <Text style={styles.backText}>Quay lại</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.videoArea, { width: windowWidth, height: videoHeight }]}>
                {youtubeId ? (
                    <View style={{ width: windowWidth, height: videoHeight }}>
                        
                        {renderVideoPlayer()}

                        {loading && (
                            <View style={styles.loaderOverlay}>
                                <ActivityIndicator size="large" color="#e50914" />
                            </View>
                        )}
                    </View>
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
            </View>

            <View style={styles.info}>
                <Text style={styles.infoTitle}>{movie.title}</Text>
                <Text style={styles.infoMeta}>
                    {movie.year}{movie.rating ? `  ·  ⭐ ${movie.rating}` : ""}
                    {movie.director ? `  ·  🎬 ${movie.director}` : ""}
                </Text>
                {startAt > 0 && (
                    <Text style={styles.resumeText}>▶ Tiếp tục từ {formatTime(startAt)}</Text>
                )}
                <Text style={styles.elapsedText}>
                    ⏱ Đã xem: {formatTime(elapsed)} {isPlaying ? "• Đang đếm" : "• Đã dừng"}
                </Text>

                {movie.cast_list ? (
                    <>
                        <Text style={styles.castLabel}>Diễn viên</Text>
                        <Text style={styles.castText}>{movie.cast_list}</Text>
                    </>
                ) : null}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container:    { flex: 1, backgroundColor: "#0a0a0a" },
    header:       { 
        flexDirection: "row", alignItems: "center", 
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14,
        backgroundColor: "#0a0a0a", borderBottomWidth: 1, borderBottomColor: "#1a1a1a",
    },
    videoArea:    { backgroundColor: "#000", overflow: "hidden" },
    loaderOverlay:{ ...StyleSheet.absoluteFillObject, backgroundColor: "#000", justifyContent: "center", alignItems: "center", zIndex: 99 },
    backBtn:      {
        flexDirection: "row", alignItems: "center", gap: 4,
        backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 20, 
        paddingVertical: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    },
    backText:     { color: "#fff", fontSize: 13, fontWeight: "600" },
    placeholder:  { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
    placeholderTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginTop: 16, textAlign: "center" },
    placeholderSub:   { color: "#555", fontSize: 13, marginTop: 10, textAlign: "center", lineHeight: 20 },
    ytBtn:        { flexDirection: "row", alignItems: "center", marginTop: 20, backgroundColor: "#cc0000", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    ytBtnText:    { color: "#fff", fontWeight: "bold", fontSize: 14 },
    info:         { flex: 1, padding: 20 },
    infoTitle:    { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 8 },
    infoMeta:     { color: "#b3b3b3", fontSize: 14, marginBottom: 6 },
    resumeText:   { color: "#e50914", fontSize: 14, fontWeight: "bold", marginTop: 8 },
    elapsedText:  { color: "#aaa", fontSize: 13, marginTop: 6, fontWeight: "500" },
    castLabel:    { color: "#fff", fontSize: 16, fontWeight: "bold", marginTop: 20, marginBottom: 6 },
    castText:     { color: "#b3b3b3", fontSize: 14, lineHeight: 22 },
});

export default VideoPlayerScreen;