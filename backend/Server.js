var express    = require("express");
var bodyParser = require("body-parser");
var cors       = require("cors");
var mysql      = require("mysql2");
var crypto     = require("crypto");
var jwt        = require("jsonwebtoken");

var app = express();
app.use(cors());
app.use(bodyParser.json());

var JWT_SECRET = "movieapp_nhom7_sprint3";

var con = mysql.createConnection({
    host:     "localhost",
    user:     "root",
    password: "987654321",
    database: "movieapp"
});

con.connect(err => {
    if (err) console.log("Lỗi kết nối: " + err.message);
    else {
        console.log("Connected MySQL MovieApp DB!!!");

        // Thêm UNIQUE KEY lịch sử xem
        con.query(
            `ALTER TABLE watch_history ADD UNIQUE KEY uq_user_movie (user_id, movie_id)`,
            err => {
                if (err && err.code !== "ER_DUP_KEYNAME")
                    console.log("watch_history UNIQUE key:", err.message);
                else
                    console.log("watch_history UNIQUE key OK");
            }
        );

        // Thêm cột role cho bảng users (nếu chưa có)
        con.query(
            `ALTER TABLE users ADD COLUMN role ENUM('user','admin') NOT NULL DEFAULT 'user'`,
            err => {
                if (err && err.code !== "ER_DUP_FIELDNAME")
                    console.log("users.role column:", err.message);
                else
                    console.log("users.role column OK");
            }
        );
    }
});

function hashPassword(password) {
    return crypto.createHash("sha256").update(password).digest("hex");
}

// Middleware xác thực token (user thường)
function authMiddleware(req, res, next) {
    var token = req.headers["authorization"]
        ? req.headers["authorization"].split(" ")[1]
        : null;
    if (!token) return res.status(401).send({ message: "Chưa đăng nhập" });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (e) {
        res.status(403).send({ message: "Token không hợp lệ" });
    }
}

// Middleware xác thực Admin
function adminMiddleware(req, res, next) {
    var token = req.headers["authorization"]
        ? req.headers["authorization"].split(" ")[1]
        : null;
    if (!token) return res.status(401).send({ message: "Chưa đăng nhập" });
    try {
        var decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "admin")
            return res.status(403).send({ message: "Bạn không có quyền Admin" });
        req.user = decoded;
        next();
    } catch (e) {
        res.status(403).send({ message: "Token không hợp lệ" });
    }
}

// ══════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════

app.post("/api/v1/auth/register", (req, res) => {
    var { full_name, email, password } = req.body;
    if (!full_name || !email || !password)
        return res.status(400).send({ message: "Vui lòng nhập đầy đủ thông tin" });
    if (password.length < 6)
        return res.status(400).send({ message: "Mật khẩu phải có ít nhất 6 ký tự" });

    var checkSql = "SELECT id FROM users WHERE email = ?";
    con.query(checkSql, [email], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0)
            return res.status(409).send({ message: "Email này đã được đăng ký" });

        var hashed    = hashPassword(password);
        var insertSql = "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)";
        con.query(insertSql, [full_name, email, hashed], (err, result) => {
            if (err) return res.status(500).send(err);
            res.status(201).send({ message: "Đăng ký thành công", userId: result.insertId });
        });
    });
});

app.post("/api/v1/auth/login", (req, res) => {
    var { email, password } = req.body;
    if (!email || !password)
        return res.status(400).send({ message: "Vui lòng nhập email và mật khẩu" });

    var sql = "SELECT * FROM users WHERE email = ?";
    con.query(sql, [email], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0)
            return res.status(401).send({ message: "Email hoặc mật khẩu không đúng" });

        var user        = results[0];
        var hashedInput = hashPassword(password);
        var isMatch     = (hashedInput === user.password) || (password === user.password);

        if (!isMatch)
            return res.status(401).send({ message: "Email hoặc mật khẩu không đúng" });

        // Đưa role vào token để adminMiddleware kiểm tra được
        var token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.status(200).send({
            message: "Đăng nhập thành công",
            token,
            user: { id: user.id, full_name: user.full_name, email: user.email, avatar: user.avatar, role: user.role }
        });
    });
});

app.get("/api/v1/auth/profile", authMiddleware, (req, res) => {
    var sql = "SELECT id, full_name, email, avatar, role, created_at FROM users WHERE id = ?";
    con.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).send({ message: "Không tìm thấy người dùng" });
        res.status(200).send(results[0]);
    });
});

app.put("/api/v1/auth/profile", authMiddleware, (req, res) => {
    var { full_name, avatar, current_password, new_password } = req.body;

    if (new_password) {
        if (!current_password)
            return res.status(400).send({ message: "Vui lòng nhập mật khẩu hiện tại" });
        if (new_password.length < 6)
            return res.status(400).send({ message: "Mật khẩu mới phải có ít nhất 6 ký tự" });

        var checkSql = "SELECT password FROM users WHERE id = ?";
        con.query(checkSql, [req.user.id], (err, results) => {
            if (err) return res.status(500).send(err);
            var stored   = results[0].password;
            var isMatch  = (hashPassword(current_password) === stored) || (current_password === stored);
            if (!isMatch)
                return res.status(401).send({ message: "Mật khẩu hiện tại không đúng" });

            var newHashed = hashPassword(new_password);
            var sql = "UPDATE users SET full_name = ?, avatar = ?, password = ? WHERE id = ?";
            con.query(sql, [full_name, avatar, newHashed, req.user.id], (err) => {
                if (err) return res.status(500).send(err);
                res.status(200).send({ message: "Cập nhật hồ sơ thành công" });
            });
        });
    } else {
        var sql = "UPDATE users SET full_name = ?, avatar = ? WHERE id = ?";
        con.query(sql, [full_name, avatar, req.user.id], (err) => {
            if (err) return res.status(500).send(err);
            res.status(200).send({ message: "Cập nhật hồ sơ thành công" });
        });
    }
});

// ══════════════════════════════════════════════════════════
// MOVIES (public)
// ══════════════════════════════════════════════════════════

app.get("/api/v1/movies/popular", (req, res) => {
    var sql = "SELECT * FROM movies ORDER BY view_count DESC, rating DESC LIMIT 15";
    con.query(sql, (err, movies) => {
        if (err) return res.status(500).send(err);
        if (movies.length === 0) return res.status(200).send([]);

        var ids = movies.map(m => m.id);
        var genreSql = `SELECT mg.movie_id, g.name FROM movie_genres mg
                        JOIN genres g ON mg.genre_id = g.id
                        WHERE mg.movie_id IN (?)`;
        con.query(genreSql, [ids], (err, genreRows) => {
            if (err) return res.status(500).send(err);
            var result = movies.map(m => ({
                ...m,
                genres: genreRows.filter(g => g.movie_id === m.id).map(g => g.name)
            }));
            res.status(200).send(result);
        });
    });
});

app.get("/api/v1/movies", (req, res) => {
    var search   = req.query.search   || "";
    var genre_id = req.query.genre_id || "";
    var page     = parseInt(req.query.page)  || 1;
    var limit    = parseInt(req.query.limit) || 20;
    var offset   = (page - 1) * limit;

    var sql    = "SELECT DISTINCT m.* FROM movies m";
    var params = [];

    if (genre_id) {
        sql += " JOIN movie_genres mg ON m.id = mg.movie_id WHERE mg.genre_id = ?";
        params.push(genre_id);
    }
    if (search) {
        var keyword = "%" + search + "%";
        sql += genre_id ? " AND" : " WHERE";
        sql += " (m.title LIKE ? OR m.director LIKE ? OR m.cast_list LIKE ?)";
        params.push(keyword, keyword, keyword);
    }
    sql += " ORDER BY m.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    con.query(sql, params, (err, movies) => {
        if (err) return res.status(500).send(err);
        if (movies.length === 0) return res.status(200).send([]);

        var ids = movies.map(m => m.id);
        var genreSql = `SELECT mg.movie_id, g.name FROM movie_genres mg
                        JOIN genres g ON mg.genre_id = g.id
                        WHERE mg.movie_id IN (?)`;
        con.query(genreSql, [ids], (err, genreRows) => {
            if (err) return res.status(500).send(err);
            var result = movies.map(m => ({
                ...m,
                genres: genreRows.filter(g => g.movie_id === m.id).map(g => g.name)
            }));
            res.status(200).send(result);
        });
    });
});

app.get("/api/v1/movies/:id", (req, res) => {
    var sql = "SELECT * FROM movies WHERE id = ?";
    con.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).send({ message: "Không tìm thấy phim" });

        var movie = results[0];
        var genreSql = `SELECT g.id, g.name FROM movie_genres mg
                        JOIN genres g ON mg.genre_id = g.id
                        WHERE mg.movie_id = ?`;
        con.query(genreSql, [movie.id], (err, genreRows) => {
            if (err) return res.status(500).send(err);
            movie.genres = genreRows.map(g => g.name);
            res.status(200).send(movie);
        });
    });
});

// ══════════════════════════════════════════════════════════
// GENRES (public)
// ══════════════════════════════════════════════════════════

app.get("/api/v1/genres", (req, res) => {
    con.query("SELECT * FROM genres ORDER BY name", (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(results);
    });
});

// ══════════════════════════════════════════════════════════
// FAVORITES
// ══════════════════════════════════════════════════════════

app.get("/api/v1/favorites", authMiddleware, (req, res) => {
    var sql = `SELECT m.* FROM favorites f
               JOIN movies m ON f.movie_id = m.id
               WHERE f.user_id = ?
               ORDER BY f.created_at DESC`;
    con.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(results);
    });
});

app.post("/api/v1/favorites", authMiddleware, (req, res) => {
    var { movie_id } = req.body;
    var checkSql = "SELECT id FROM favorites WHERE user_id = ? AND movie_id = ?";
    con.query(checkSql, [req.user.id, movie_id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length > 0)
            return res.status(409).send({ message: "Phim đã có trong danh sách yêu thích" });

        var insertSql = "INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)";
        con.query(insertSql, [req.user.id, movie_id], (err, result) => {
            if (err) return res.status(500).send(err);
            res.status(201).send({ message: "Đã thêm vào yêu thích", id: result.insertId });
        });
    });
});

app.delete("/api/v1/favorites/:movieId", authMiddleware, (req, res) => {
    var sql = "DELETE FROM favorites WHERE user_id = ? AND movie_id = ?";
    con.query(sql, [req.user.id, req.params.movieId], (err) => {
        if (err) return res.status(500).send(err);
        res.status(200).send({ message: "Đã xóa khỏi yêu thích" });
    });
});

// ══════════════════════════════════════════════════════════
// WATCH HISTORY
// ══════════════════════════════════════════════════════════

app.get("/api/v1/history", authMiddleware, (req, res) => {
    var sql = `SELECT m.id AS id, wh.movie_id, m.title, m.description, m.year, m.rating,
                      m.poster_url, m.trailer_url, m.director, m.cast_list,
                      m.view_count, m.created_at,
                      wh.progress_seconds, wh.updated_at AS watched_at
               FROM watch_history wh
               JOIN movies m ON wh.movie_id = m.id
               WHERE wh.user_id = ?
               ORDER BY wh.updated_at DESC`;
    con.query(sql, [req.user.id], (err, movies) => {
        if (err) return res.status(500).send(err);
        if (movies.length === 0) return res.status(200).send([]);

        var ids = movies.map(m => m.id);
        var genreSql = `SELECT mg.movie_id, g.name FROM movie_genres mg
                        JOIN genres g ON mg.genre_id = g.id
                        WHERE mg.movie_id IN (?)`;
        con.query(genreSql, [ids], (err, genreRows) => {
            if (err) return res.status(500).send(err);
            var result = movies.map(m => ({
                ...m,
                genres: genreRows.filter(g => g.movie_id === m.id).map(g => g.name)
            }));
            res.status(200).send(result);
        });
    });
});

app.put("/api/v1/history", authMiddleware, (req, res) => {
    var { movie_id, progress_seconds } = req.body;
    if (!movie_id) return res.status(400).send({ message: "Thiếu movie_id" });

    var sql = `INSERT INTO watch_history (user_id, movie_id, progress_seconds)
               VALUES (?, ?, ?)
               ON DUPLICATE KEY UPDATE progress_seconds = ?, updated_at = NOW()`;
    con.query(sql, [req.user.id, movie_id, progress_seconds, progress_seconds], (err) => {
        if (err) return res.status(500).send(err);
        res.status(200).send({ message: "Đã lưu tiến trình" });
    });
});

app.delete("/api/v1/history/:movieId", authMiddleware, (req, res) => {
    var sql = "DELETE FROM watch_history WHERE user_id = ? AND movie_id = ?";
    con.query(sql, [req.user.id, req.params.movieId], (err) => {
        if (err) return res.status(500).send(err);
        res.status(200).send({ message: "Đã xoá khỏi lịch sử" });
    });
});

// ══════════════════════════════════════════════════════════
// ADMIN – QUẢN LÝ NGƯỜI DÙNG
// ══════════════════════════════════════════════════════════

// Lấy danh sách tất cả người dùng
app.get("/api/v1/admin/users", adminMiddleware, (req, res) => {
    var sql = "SELECT id, full_name, email, avatar, role, created_at FROM users ORDER BY created_at DESC";
    con.query(sql, (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(results);
    });
});

// Xóa người dùng (không cho xóa chính mình)
app.delete("/api/v1/admin/users/:id", adminMiddleware, (req, res) => {
    var userId = parseInt(req.params.id);
    if (userId === req.user.id)
        return res.status(400).send({ message: "Không thể xóa tài khoản Admin đang đăng nhập" });

    var sql = "DELETE FROM users WHERE id = ?";
    con.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).send({ message: "Không tìm thấy người dùng" });
        res.status(200).send({ message: "Đã xóa người dùng" });
    });
});

// ══════════════════════════════════════════════════════════
// ADMIN – QUẢN LÝ PHIM
// ══════════════════════════════════════════════════════════

// Thêm phim mới
app.post("/api/v1/admin/movies", adminMiddleware, (req, res) => {
    var { title, description, year, rating, poster_url, trailer_url, director, cast_list, video_url, genre_ids } = req.body;

    if (!title || !year)
        return res.status(400).send({ message: "Tiêu đề và năm phát hành là bắt buộc" });

    var sql = `INSERT INTO movies (title, description, year, rating, poster_url, trailer_url, director, cast_list, video_url, view_count)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`;
    con.query(sql, [title, description, year, rating || 0, poster_url, trailer_url, director, cast_list, video_url], (err, result) => {
        if (err) return res.status(500).send(err);

        var movieId = result.insertId;

        // Gán thể loại nếu có
        if (genre_ids && genre_ids.length > 0) {
            var genreValues = genre_ids.map(gid => [movieId, gid]);
            con.query("INSERT INTO movie_genres (movie_id, genre_id) VALUES ?", [genreValues], (err) => {
                if (err) return res.status(500).send(err);
                res.status(201).send({ message: "Đã thêm phim mới", movieId });
            });
        } else {
            res.status(201).send({ message: "Đã thêm phim mới", movieId });
        }
    });
});

// Cập nhật thông tin phim
app.put("/api/v1/admin/movies/:id", adminMiddleware, (req, res) => {
    var { title, description, year, rating, poster_url, trailer_url, director, cast_list, video_url, genre_ids } = req.body;
    var movieId = req.params.id;

    var sql = `UPDATE movies SET title=?, description=?, year=?, rating=?, poster_url=?,
               trailer_url=?, director=?, cast_list=?, video_url=? WHERE id=?`;
    con.query(sql, [title, description, year, rating, poster_url, trailer_url, director, cast_list, video_url, movieId], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).send({ message: "Không tìm thấy phim" });

        // Cập nhật lại thể loại: xóa cũ rồi thêm mới
        con.query("DELETE FROM movie_genres WHERE movie_id = ?", [movieId], (err) => {
            if (err) return res.status(500).send(err);

            if (genre_ids && genre_ids.length > 0) {
                var genreValues = genre_ids.map(gid => [movieId, gid]);
                con.query("INSERT INTO movie_genres (movie_id, genre_id) VALUES ?", [genreValues], (err) => {
                    if (err) return res.status(500).send(err);
                    res.status(200).send({ message: "Đã cập nhật phim" });
                });
            } else {
                res.status(200).send({ message: "Đã cập nhật phim" });
            }
        });
    });
});

// Xóa phim
app.delete("/api/v1/admin/movies/:id", adminMiddleware, (req, res) => {
    var movieId = req.params.id;

    // Xóa dữ liệu liên quan trước khi xóa phim
    con.query("DELETE FROM movie_genres WHERE movie_id = ?", [movieId], (err) => {
        if (err) return res.status(500).send(err);
        con.query("DELETE FROM favorites WHERE movie_id = ?", [movieId], (err) => {
            if (err) return res.status(500).send(err);
            con.query("DELETE FROM watch_history WHERE movie_id = ?", [movieId], (err) => {
                if (err) return res.status(500).send(err);
                con.query("DELETE FROM movies WHERE id = ?", [movieId], (err, result) => {
                    if (err) return res.status(500).send(err);
                    if (result.affectedRows === 0) return res.status(404).send({ message: "Không tìm thấy phim" });
                    res.status(200).send({ message: "Đã xóa phim" });
                });
            });
        });
    });
});

// ══════════════════════════════════════════════════════════
// ADMIN – QUẢN LÝ THỂ LOẠI
// ══════════════════════════════════════════════════════════

// Thêm thể loại mới
app.post("/api/v1/admin/genres", adminMiddleware, (req, res) => {
    var { name } = req.body;
    if (!name) return res.status(400).send({ message: "Tên thể loại là bắt buộc" });

    con.query("INSERT INTO genres (name) VALUES (?)", [name], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(201).send({ message: "Đã thêm thể loại", id: result.insertId, name });
    });
});

// Cập nhật thể loại
app.put("/api/v1/admin/genres/:id", adminMiddleware, (req, res) => {
    var { name } = req.body;
    if (!name) return res.status(400).send({ message: "Tên thể loại là bắt buộc" });

    con.query("UPDATE genres SET name = ? WHERE id = ?", [name, req.params.id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).send({ message: "Không tìm thấy thể loại" });
        res.status(200).send({ message: "Đã cập nhật thể loại" });
    });
});

// Xóa thể loại
app.delete("/api/v1/admin/genres/:id", adminMiddleware, (req, res) => {
    // Xóa liên kết phim-thể loại trước
    con.query("DELETE FROM movie_genres WHERE genre_id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        con.query("DELETE FROM genres WHERE id = ?", [req.params.id], (err, result) => {
            if (err) return res.status(500).send(err);
            if (result.affectedRows === 0) return res.status(404).send({ message: "Không tìm thấy thể loại" });
            res.status(200).send({ message: "Đã xóa thể loại" });
        });
    });
});

// ──────────────────────────────────────────────────────────
app.listen(5555, () => console.log("MovieApp Server running at http://192.168.1.59:5555"));