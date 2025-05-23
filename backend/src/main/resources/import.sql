
ALTER TABLE posts DROP CONSTRAINT fkfheekp1ddxo90erweblld3axm;
ALTER TABLE reposts DROP CONSTRAINT fkersix1dfhot0h5xp4umnh2mgr;
ALTER TABLE songs DROP CONSTRAINT fkte4gkb2cqtk2erfa87oopj2cj;
ALTER TABLE posts DROP CONSTRAINT fk89ik4e9tqc05yvnct49n1fhto;

--INSERTS--

-- Users
INSERT INTO users (name, mail, first_name, surname, pass, profile_img, role) VALUES
('nico', 'nico@gmail.com', 'Nicolas', 'Buquet', '$2a$10$EfZNeGwyxw4xegJYnvamE.kHlUmVeE/32iEgtTUhjqFSRncRuK64y', 'http://localhost:8080/api/media/defaultu.jpg', 'user'),
('jorge', 'jorge@gmail.com', 'Jorge', 'Lopez', '$2a$10$EfZNeGwyxw4xegJYnvamE.kHlUmVeE/32iEgtTUhjqFSRncRuK64y', 'http://localhost:8080/api/media/defaultu.jpg', 'user'),
('johndoe', 'john@example.com', 'john', 'doe', 'pass1', 'http://localhost:8080/api/media/defaultu.jpg', 'user'),
('janedoe', 'jane@example.com', 'jane', 'doe',  'pass2', 'http://localhost:8080/api/media/defaultu.jpg', 'user'),
('bobsmith', 'bob@example.com', 'bob', 'smith',  'pass3', 'http://localhost:8080/api/media/defaultu.jpg', 'admin');

-- Albums
INSERT INTO albums (id, name, cover_img, date, user_name) VALUES
(1, 'Summer Vibes', 'http://localhost:8080/api/media/defaultc.png', '2023-06-01', 'johndoe');
ALTER SEQUENCE albums_seq RESTART WITH 2;

-- Elimina la constraint existente
ALTER TABLE albums DROP CONSTRAINT fklcrj8o8xk0s856f6wl9o7vuib;

-- Vuelve a crear la constraint con ON DELETE CASCADE
ALTER TABLE albums 
ADD CONSTRAINT fk_albums_user 
FOREIGN KEY (user_name) REFERENCES users(name) ON DELETE CASCADE;

-- Follows
INSERT INTO follows (id, created_at, follower, followed) VALUES
(1, '2023-01-01 10:00:00', 'jorge', 'janedoe'),
(2, '2023-01-02 11:00:00', 'jorge', 'bobsmith'),
(3, '2023-01-03 12:00:00', 'jorge', 'johndoe'),
(4, '2023-01-03 12:00:00', 'jorge', 'nico'),
(5, '2023-01-01 10:00:00', 'nico', 'janedoe'),
(6, '2023-01-02 11:00:00', 'nico', 'bobsmith'),
(7, '2023-01-03 12:00:00', 'nico', 'johndoe'),
(8, '2023-01-03 12:00:00', 'nico', 'jorge');
ALTER SEQUENCE follows_seq RESTART WITH 9;


-- Posts
INSERT INTO posts (id, created_at, user_name, album_id, song_id) VALUES
(1, '2024-03-17 09:00:00', 'nico', null, 4),
(2, '2023-12-16 10:00:00', 'janedoe', null, 3),
(3, '2024-03-16 11:00:00', 'bobsmith', 1, null);
ALTER SEQUENCE posts_seq RESTART WITH 4;


/* ALTER TABLE posts 
ADD CONSTRAINT fk_posts_user 
FOREIGN KEY (user_name) REFERENCES users(name) ON DELETE CASCADE;

ALTER TABLE posts 
ADD CONSTRAINT fk_posts_song
FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE; */

-- Reposts
INSERT INTO reposts (id, created_at, user_name, post_id) VALUES
(1, '2023-06-17 12:00:00', 'janedoe', 1),
(2, '2023-12-17 13:00:00', 'bobsmith', 2),
(3, '2023-03-17 14:00:00', 'johndoe', 3),
(4, '2023-03-17 14:00:00', 'nico', 2);
ALTER SEQUENCE reposts_seq RESTART WITH 5;

-- Songs
INSERT INTO songs (id, name, cover_img, date, audio, user_name, album_id) VALUES
(1, 'Sunshine', 'http://localhost:8080/api/media/defaultc.png', '2023-06-15', 'http://localhost:8080/api/media/default.mp3', 'bobsmith', 1),
(2, 'Snowfall', 'http://localhost:8080/api/media/defaultc.png', '2023-12-15', 'http://localhost:8080/api/media/default.mp3', 'bobsmith', 1),
(3, 'Bloom', 'http://localhost:8080/api/media/defaultc.png', '2023-03-15', 'http://localhost:8080/api/media/default.mp3', 'janedoe', null),
(4, 'mastercaster', 'http://localhost:8080/api/media/defaultc.png', '2023-03-15', 'http://localhost:8080/api/media/default.mp3', 'nico', null);
ALTER SEQUENCE songs_seq RESTART WITH 5;

DROP TABLE IF EXISTS search_view CASCADE;
DROP TABLE IF EXISTS user_page_view CASCADE;

CREATE VIEW search_view (name, id, type) AS
SELECT name, NULL::BIGINT AS id, 'user' AS type, profile_img AS img FROM users UNION ALL
SELECT name, id, 'song' AS type, cover_img AS img FROM songs UNION ALL
SELECT name, id, 'album' AS type, cover_img AS img FROM albums;

CREATE VIEW user_page_view (name, profile_img, posts, followed, followers) AS
SELECT u.name, u.profile_img, COUNT(p.id) AS posts, COUNT(DISTINCT f1.followed) AS followed, COUNT(DISTINCT f2.followed) AS followers
FROM users u
LEFT JOIN posts p ON u.name = p.user_name
LEFT JOIN follows f1 ON u.name = f1.follower
LEFT JOIN follows f2 ON u.name = f2.followed
GROUP BY u.name, u.profile_img;


/*
-- Rates
INSERT INTO rates (id, rate, created_at, user_name, post_id) VALUES
(1, 5, '2023-06-18 15:00:00', 'janedoe', 1),
(2, 4, '2023-12-18 16:00:00', 'bobsmith', 2),
(3, 5, '2023-03-18 17:00:00', 'johndoe', 3);
ALTER SEQUENCE rates_seq RESTART WITH 4;

-- Saves
INSERT INTO saves (id, created_at, user_name, post_id) VALUES
(1, '2023-06-19 18:00:00', 'janedoe', 1),
(2, '2023-12-19 19:00:00', 'bobsmith', 2),
(3, '2023-03-19 20:00:00', 'johndoe', 3);
ALTER SEQUENCE saves_seq RESTART WITH 4;

-- Comments
INSERT INTO comments (id, content, likes, user_name, post_id, comment_id) VALUES
(1, 'Great song!', 5, 'janedoe', 1, NULL),
(2, 'Love this album!', 3, 'bobsmith', 2, NULL),
(3, 'Amazing work!', 7, 'johndoe', 3, NULL);
ALTER SEQUENCE comments_seq RESTART WITH 4;
 */