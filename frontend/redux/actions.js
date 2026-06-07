// ── CẤU HÌNH IP ──
// ĐỔI IP NÀY THEO MÁY CỦA BẠN (ipconfig → IPv4 Address)
// Dùng chung 1 IP cho cả 3 môi trường: Expo Go (quét QR), Android Studio (nhấn a), Web (nhấn w)
export const API = "http://192.168.1.59:5555/api/v1";

// ── MOVIES ──
export const SET_MOVIES          = "SET_MOVIES";
export const SET_POPULAR_MOVIES  = "SET_POPULAR_MOVIES";
export const SET_SELECTED_MOVIE  = "SET_SELECTED_MOVIE";
export const SET_MOVIES_LOADING  = "SET_MOVIES_LOADING";
export const SET_MOVIES_ERROR    = "SET_MOVIES_ERROR";

export const fetchPopularMovies = () => async (dispatch) => {
    dispatch({ type: SET_MOVIES_LOADING, payload: true });
    try {
        const res  = await fetch(`${API}/movies/popular`);
        const data = await res.json();
        dispatch({ type: SET_POPULAR_MOVIES, payload: data });
    } catch (err) {
        dispatch({ type: SET_MOVIES_ERROR, payload: err.message });
    } finally {
        dispatch({ type: SET_MOVIES_LOADING, payload: false });
    }
};

export const fetchMovies = (params = {}) => async (dispatch) => {
    dispatch({ type: SET_MOVIES_LOADING, payload: true });
    try {
        const query = new URLSearchParams(params).toString();
        const res   = await fetch(`${API}/movies?${query}`);
        const data  = await res.json();
        dispatch({ type: SET_MOVIES, payload: data });
    } catch (err) {
        dispatch({ type: SET_MOVIES_ERROR, payload: err.message });
    } finally {
        dispatch({ type: SET_MOVIES_LOADING, payload: false });
    }
};

export const fetchMovieById = (id) => async (dispatch) => {
    try {
        const res  = await fetch(`${API}/movies/${id}`);
        const data = await res.json();
        dispatch({ type: SET_SELECTED_MOVIE, payload: data });
    } catch (err) {
        dispatch({ type: SET_MOVIES_ERROR, payload: err.message });
    }
};

// ── AUTH ───
export const SET_USER         = "SET_USER";
export const SET_TOKEN        = "SET_TOKEN";
export const SET_AUTH_LOADING = "SET_AUTH_LOADING";
export const SET_AUTH_ERROR   = "SET_AUTH_ERROR";
export const LOGOUT           = "LOGOUT";

export const login = (email, password) => async (dispatch) => {
    dispatch({ type: SET_AUTH_LOADING, payload: true });
    try {
        const res  = await fetch(`${API}/auth/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        dispatch({ type: SET_TOKEN,      payload: data.token });
        dispatch({ type: SET_USER,       payload: data.user  });
        dispatch({ type: SET_AUTH_ERROR, payload: null       });
    } catch (err) {
        dispatch({ type: SET_AUTH_ERROR, payload: err.message });
    } finally {
        dispatch({ type: SET_AUTH_LOADING, payload: false });
    }
};

export const register = (full_name, email, password) => async (dispatch) => {
    dispatch({ type: SET_AUTH_LOADING, payload: true });
    try {
        const res  = await fetch(`${API}/auth/register`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ full_name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        dispatch({ type: SET_AUTH_ERROR, payload: null });
        return true;
    } catch (err) {
        dispatch({ type: SET_AUTH_ERROR, payload: err.message });
        return false;
    } finally {
        dispatch({ type: SET_AUTH_LOADING, payload: false });
    }
};

export const logout = () => ({ type: LOGOUT });

export const updateProfile = (profileData, token) => async (dispatch, getState) => {
    dispatch({ type: SET_AUTH_LOADING, payload: true });
    try {
        const res  = await fetch(`${API}/auth/profile`, {
            method:  "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body:    JSON.stringify(profileData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        // Giữ lại toàn bộ thông tin user cũ (id, email, role...), chỉ ghi đè những gì vừa sửa
        const currentUser = getState().user;
        dispatch({ type: SET_USER,       payload: { ...currentUser, ...profileData } });
        dispatch({ type: SET_AUTH_ERROR, payload: null });
        return { success: true };
    } catch (err) {
        dispatch({ type: SET_AUTH_ERROR, payload: err.message });
        return { success: false, message: err.message };
    } finally {
        dispatch({ type: SET_AUTH_LOADING, payload: false });
    }
};

// ── FAVORITES ──
export const SET_FAVORITES         = "SET_FAVORITES";
export const SET_FAVORITE_MOVIES   = "SET_FAVORITE_MOVIES";
export const ADD_FAVORITE          = "ADD_FAVORITE";
export const ADD_FAVORITE_MOVIE    = "ADD_FAVORITE_MOVIE";
export const REMOVE_FAVORITE       = "REMOVE_FAVORITE";
export const SET_FAVORITES_LOADING = "SET_FAVORITES_LOADING";

export const fetchFavorites = (token) => async (dispatch) => {
    dispatch({ type: SET_FAVORITES_LOADING, payload: true });
    try {
        const res  = await fetch(`${API}/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        dispatch({ type: SET_FAVORITES,       payload: data });
        dispatch({ type: SET_FAVORITE_MOVIES, payload: data });
    } catch (err) {
    } finally {
        dispatch({ type: SET_FAVORITES_LOADING, payload: false });
    }
};

export const addFavorite = (movieId, token) => async (dispatch) => {
    try {
        const res = await fetch(`${API}/favorites`, {
            method:  "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body:    JSON.stringify({ movie_id: movieId }),
        });
        if (res.ok) {
            dispatch({ type: ADD_FAVORITE, payload: movieId });
            try {
                const movieRes  = await fetch(`${API}/movies/${movieId}`);
                const movieData = await movieRes.json();
                if (movieRes.ok) dispatch({ type: ADD_FAVORITE_MOVIE, payload: movieData });
            } catch (_) {}
        }
    } catch (err) {}
};

export const removeFavorite = (movieId, token) => async (dispatch) => {
    try {
        const res = await fetch(`${API}/favorites/${movieId}`, {
            method:  "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) dispatch({ type: REMOVE_FAVORITE, payload: movieId });
    } catch (err) {}
};

// ── WATCH HISTORY ──
export const SET_HISTORY         = "SET_HISTORY";
export const REMOVE_HISTORY      = "REMOVE_HISTORY";
export const SET_HISTORY_LOADING = "SET_HISTORY_LOADING";

export const fetchHistory = (token) => async (dispatch) => {
    dispatch({ type: SET_HISTORY_LOADING, payload: true });
    try {
        const res  = await fetch(`${API}/history`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        dispatch({ type: SET_HISTORY, payload: data });
    } catch (err) {
    } finally {
        dispatch({ type: SET_HISTORY_LOADING, payload: false });
    }
};

export const saveProgress = (movieId, progressSeconds, token) => async () => {
    try {
        await fetch(`${API}/history`, {
            method:  "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body:    JSON.stringify({ movie_id: movieId, progress_seconds: progressSeconds }),
        });
    } catch (err) {}
};

export const removeHistory = (movieId, token) => async (dispatch) => {
    try {
        const res = await fetch(`${API}/history/${movieId}`, {
            method:  "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) dispatch({ type: REMOVE_HISTORY, payload: movieId });
    } catch (err) {}
};