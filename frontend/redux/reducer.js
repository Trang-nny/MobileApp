import {
    SET_MOVIES, SET_POPULAR_MOVIES, SET_SELECTED_MOVIE,
    SET_MOVIES_LOADING, SET_MOVIES_ERROR,
    SET_USER, SET_TOKEN, SET_AUTH_LOADING, SET_AUTH_ERROR, LOGOUT,
    SET_FAVORITES, ADD_FAVORITE, REMOVE_FAVORITE, SET_FAVORITES_LOADING,
    SET_HISTORY, REMOVE_HISTORY, SET_HISTORY_LOADING,
} from "./actions";

const initialState = {
    movies:           [],
    popularMovies:    [],
    selectedMovie:    null,
    moviesLoading:    false,
    moviesError:      null,
    user:             null,
    token:            null,
    authLoading:      false,
    authError:        null,
    favoriteIds:      [],
    favoritesLoading: false,
    history:          [],
    historyLoading:   false,
};

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case SET_MOVIES:           return { ...state, movies:          action.payload };
        case SET_POPULAR_MOVIES:   return { ...state, popularMovies:   action.payload };
        case SET_SELECTED_MOVIE:   return { ...state, selectedMovie:   action.payload };
        case SET_MOVIES_LOADING:   return { ...state, moviesLoading:   action.payload };
        case SET_MOVIES_ERROR:     return { ...state, moviesError:     action.payload };
        case SET_USER:             return { ...state, user:            action.payload };
        case SET_TOKEN:            return { ...state, token:           action.payload };
        case SET_AUTH_LOADING:     return { ...state, authLoading:     action.payload };
        case SET_AUTH_ERROR:       return { ...state, authError:       action.payload };
        case LOGOUT:               return { ...state, user: null, token: null, favoriteIds: [], history: [] };
        case SET_FAVORITES:        return { ...state, favoriteIds:     action.payload.map(m => Number(m.id)) };
        case ADD_FAVORITE:         return { ...state, favoriteIds:     [...state.favoriteIds, Number(action.payload)] };
        // FIX: ép cả 2 vế về Number để so sánh đúng
        case REMOVE_FAVORITE:      return { ...state, favoriteIds:     state.favoriteIds.filter(id => id !== Number(action.payload)) };
        case SET_FAVORITES_LOADING:return { ...state, favoritesLoading:action.payload };
        case SET_HISTORY:          return { ...state, history:         action.payload };
        // FIX: so sánh qua movie_id (nếu có) hoặc id, ép Number để tránh "1" !== 1
        case REMOVE_HISTORY:       return { ...state, history: state.history.filter(m => Number(m.movie_id ?? m.id) !== Number(action.payload)) };
        case SET_HISTORY_LOADING:  return { ...state, historyLoading:  action.payload };
        default:                   return state;
    }
}