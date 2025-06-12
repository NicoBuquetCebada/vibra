
ALTER TABLE posts DROP CONSTRAINT fkfheekp1ddxo90erweblld3axm;
ALTER TABLE reposts DROP CONSTRAINT fkersix1dfhot0h5xp4umnh2mgr;
ALTER TABLE songs DROP CONSTRAINT fkte4gkb2cqtk2erfa87oopj2cj;
ALTER TABLE posts DROP CONSTRAINT fk89ik4e9tqc05yvnct49n1fhto;
ALTER TABLE albums DROP CONSTRAINT fklcrj8o8xk0s856f6wl9o7vuib;
ALTER TABLE rates DROP CONSTRAINT fkcmg8iasa7rtthx09ygse9san5;

--INSERTS--

-- Users
INSERT INTO users (name, mail, first_name, surname, pass, profile_img, role) VALUES
('nico', 'nico@gmail.com', 'Nicolas', 'Buquet', '$2a$10$EfZNeGwyxw4xegJYnvamE.kHlUmVeE/32iEgtTUhjqFSRncRuK64y', 'http://vibra/api/media/defaultu.png', 'user'),
('jorge', 'jorge@gmail.com', 'Jorge', 'Lopez', '$2a$10$EfZNeGwyxw4xegJYnvamE.kHlUmVeE/32iEgtTUhjqFSRncRuK64y', 'http://vibra/api/media/defaultu.png', 'user'),
('ardo440', 'ardo@gmail.com', 'Eduardo', 'Valero', '$2a$10$EfZNeGwyxw4xegJYnvamE.kHlUmVeE/32iEgtTUhjqFSRncRuK64y', 'http://vibra/api/media/ab67616d0000e1a367db700bc522216086b368cc.webp', 'user'),
('midasalonso', 'midas@gmail.com', 'Midas', 'Alonso', '$2a$10$EfZNeGwyxw4xegJYnvamE.kHlUmVeE/32iEgtTUhjqFSRncRuK64y', 'http://vibra/api/media/ab6761610000939bf746f1198d4c61a08a8d6ea7.webp', 'user'),
('elcantante', 'hector@gmail.com', 'Hector', 'Lavoe', '$2a$10$EfZNeGwyxw4xegJYnvamE.kHlUmVeE/32iEgtTUhjqFSRncRuK64y', 'http://vibra/api/media/ab6761610000939b19eb17f74f8216e408511ea3.webp', 'user'),
('ergopro', 'ergo@gmail.com', 'Ergo', 'Pro', '$2a$10$EfZNeGwyxw4xegJYnvamE.kHlUmVeE/32iEgtTUhjqFSRncRuK64y', 'http://vibra/api/media/ab6761610000e5eb1d167c8f83c22994e901dfba-2894045711.jpg', 'user'),
('illpeke', 'peke@gmail.com', 'Ill', 'Pekenio', '$2a$10$EfZNeGwyxw4xegJYnvamE.kHlUmVeE/32iEgtTUhjqFSRncRuK64y', 'http://vibra/api/media/ab67706c0000d72c1f44c8d876a8d82309842074.webp', 'user'),
('eliotoffana', 'elio@gmail.com', 'Elio', 'Toffana', '$2a$10$EfZNeGwyxw4xegJYnvamE.kHlUmVeE/32iEgtTUhjqFSRncRuK64y', 'http://vibra/api/media/cfbdc8545a1149c8b174c494007f3a187ed298ed66e8a31992c4bfe191d2e946.jpg', 'user'),
('elcuarteto', 'roberto@gmail.com', 'Roberto', 'Musso', '$2a$10$EfZNeGwyxw4xegJYnvamE.kHlUmVeE/32iEgtTUhjqFSRncRuK64y', 'http://vibra/api/media/ab67616d00001e022c68bbac0ee69a6095202ba7.webp', 'user');
--('', '', '', '', '$2a$10$EfZNeGwyxw4xegJYnvamE.kHlUmVeE/32iEgtTUhjqFSRncRuK64y', 'http://vibra/api/media/defaultu.png', 'user'),


-- Follows
INSERT INTO follows (id, created_at, follower, followed) VALUES
(1, '2023-01-01 10:00:00', 'jorge', 'midasalonso'),
(2, '2023-01-02 11:00:00', 'jorge', 'ergopro'),
(3, '2023-01-03 12:00:00', 'jorge', 'illpeke'),
(4, '2023-01-03 12:00:00', 'jorge', 'nico'),
(5, '2023-01-01 10:00:00', 'nico', 'elcantante'),
(6, '2023-01-02 11:00:00', 'nico', 'ardo440'),
(7, '2023-01-03 12:00:00', 'nico', 'eliotoffana'),
(8, '2023-01-03 12:00:00', 'nico', 'elcuarteto'),
(9, '2023-01-03 12:00:00', 'nico', 'ergopro'),
(10, '2023-01-03 12:00:00', 'nico', 'illpeke'),
(11, '2023-01-03 12:00:00', 'nico', 'jorge'),
(12, '2023-01-03 12:00:00', 'nico', 'midasalonso');
ALTER SEQUENCE follows_seq RESTART WITH 13;


-- Posts
INSERT INTO posts (id, created_at, user_name, album_id, song_id) VALUES
(1, '2025-06-01 11:17:43', 'ardo440', null, 1),
(2, '2025-06-01 11:17:44', 'ardo440', 1, null),
(3, '2025-06-01 11:17:45', 'midasalonso', null, 5),
(4, '2025-06-01 11:17:46', 'midasalonso', null, 6),
(5, '2025-06-01 11:17:47', 'midasalonso', null, 7);
/* (1, '2025-06-01 11:17:43', '', null, ),
(1, '2025-06-01 11:17:43', '', null, ),
(1, '2025-06-01 11:17:43', '', null, ),
(1, '2025-06-01 11:17:43', '', null, ),
(1, '2025-06-01 11:17:43', '', null, ),
(1, '2025-06-01 11:17:43', '', null, ),
(1, '2025-06-01 11:17:43', '', null, ),
(1, '2025-06-01 11:17:43', '', null, ),
(1, '2025-06-01 11:17:43', '', null, ),
(1, '2025-06-01 11:17:43', '', null, ), */
ALTER SEQUENCE posts_seq RESTART WITH 6;

-- Songs
INSERT INTO songs (id, name, cover_img, date, audio, user_name, album_id) VALUES
(1, 'Depelicula', 'http://vibra/api/media/ab67616d00001e02864d1711060de17fabb8b7da.jpg', '2025-06-01', 'http://vibra/api/media/ab67616d00001e02864d1711060de17fabb8b7da.mp3', 'ardo440', null),
(2, '1. Halal', 'http://vibra/api/media/ab67616d00001e02c66af18adb9c5d348b7d0e0e.jpg', '2025-06-01', 'http://vibra/api/media/ab67616d00001e02c66af18adb9c5d348b7d0e0e1.mp3', 'ardo440', 1),
(3, '2. Hatar', 'http://vibra/api/media/ab67616d00001e02c66af18adb9c5d348b7d0e0e.jpg', '2025-06-01', 'http://vibra/api/media/ab67616d00001e02c66af18adb9c5d348b7d0e0e2.mp3', 'ardo440', 1),
(4, '3. Haram', 'http://vibra/api/media/ab67616d00001e02c66af18adb9c5d348b7d0e0e.jpg', '2025-06-01', 'http://vibra/api/media/ab67616d00001e02c66af18adb9c5d348b7d0e0e3.mp3', 'ardo440', 1),
(5, 'Brixton', 'http://vibra/api/media/ab67616d00001e02568a0f127f27451325ab0007.jpg', '2025-06-01', 'http://vibra/api/media/ab67616d00001e02568a0f127f27451325ab0007.mp3', 'midasalonso', null),
(6, 'Tyrion', 'http://vibra/api/media/ab67616d00001e02e46dc1f235384df97578e609.jpg', '2025-06-01', 'http://vibra/api/media/ab67616d00001e02e46dc1f235384df97578e609.mp3', 'midasalonso', null),
(7, 'Bankinter', 'http://vibra/api/media/ab67616d00001e02b96ead5c1f22561d9c190315.jpg', '2025-06-01', 'http://vibra/api/media/ab67616d00001e02b96ead5c1f22561d9c190315.mp3', 'midasalonso', null);
ALTER SEQUENCE songs_seq RESTART WITH 8;


-- Albums
INSERT INTO albums (id, name, cover_img, date, user_name) VALUES
(1, 'Hahaha', 'http://vibra/api/media/ab67616d00001e02c66af18adb9c5d348b7d0e0e.jpg', '2025-06-01', 'ardo440');
--(2, '', 'http://vibra/api/media/', '2025-06-01', ''),
ALTER SEQUENCE albums_seq RESTART WITH 2;

-- Reposts
INSERT INTO reposts (id, created_at, user_name, post_id) VALUES
(1, '2023-06-17 12:00:00', 'nico', 1);
ALTER SEQUENCE reposts_seq RESTART WITH 2;


-- Saves
INSERT INTO saves (id, created_at, user_name, post_id) VALUES
(1, '2023-06-19 18:00:00', 'nico', 1),
(2, '2023-12-19 19:00:00', 'nico', 5),
(3, '2023-03-19 20:00:00', 'nico', 3);
ALTER SEQUENCE saves_seq RESTART WITH 4;

-- Rates
INSERT INTO rates (id, rate, created_at, user_name, post_id) VALUES
(1, 5, '2023-06-18 15:00:00', 'nico', 1),
(2, 4, '2023-12-18 16:00:00', 'nico', 2),
(3, 1, '2023-03-18 17:00:00', 'nico', 4);
ALTER SEQUENCE rates_seq RESTART WITH 4;

-- VIEWS

DROP TABLE IF EXISTS search_view CASCADE;
DROP TABLE IF EXISTS notifications_view CASCADE;
DROP TABLE IF EXISTS user_page_view CASCADE;
DROP TABLE IF EXISTS user_page_posts_view CASCADE;

-- SEARCH BAR VIEW
CREATE OR REPLACE VIEW search_view (name, id, type) AS
SELECT name, NULL::BIGINT AS id, 'user' AS type, profile_img AS img FROM users UNION ALL
SELECT name, p.id AS id, 'song' AS type, cover_img AS img FROM songs s
JOIN posts p ON p.song_id = s.id UNION ALL
SELECT name, p.id AS id, 'album' AS type, cover_img AS img FROM albums a 
JOIN posts p ON p.album_id = a.id;

-- NOTIFICATIONS VIEW
CREATE OR REPLACE VIEW notifications_view (type, created_at, action_user, profile_img, content_user, content_id) AS
SELECT 'follow' AS type, f.created_at, f.follower AS action_user, u.profile_img AS profile_img, f.followed AS content_user, f.id AS content_id
FROM follows f JOIN users u ON f.follower = u.name UNION ALL
SELECT 'repost' AS type, r.created_at, r.user_name AS action_user, u.profile_img AS profile_img, p.user_name AS content_user, p.id AS content_id
FROM reposts r JOIN posts p ON r.post_id = p.id JOIN users u ON r.user_name = u.name UNION ALL
SELECT 'rate' AS type, ra.created_at, ra.user_name AS action_user, u.profile_img AS profile_img, p.user_name AS content_user, p.id AS content_id
FROM rates ra JOIN posts p ON ra.post_id = p.id JOIN users u ON ra.user_name = u.name;

-- USER PAGE INFO VIEW
CREATE VIEW user_page_view (name, profile_img, posts, followed, followers) AS
SELECT
  u.name,
  u.profile_img,
  (SELECT COUNT(*) FROM posts p WHERE p.user_name = u.name) AS posts,
  (SELECT COUNT(*) FROM follows f WHERE f.follower = u.name) AS followed,
  (SELECT COUNT(*) FROM follows f WHERE f.followed = u.name) AS followers
FROM users u;

-- USER PAGE POSTS DTO VIEW
CREATE OR REPLACE VIEW user_page_posts_view AS
SELECT
    p.id, p.user_name, p.created_at,
    CASE
        WHEN p.album_id IS NOT NULL THEN 'album'
        WHEN p.song_id IS NOT NULL THEN 'song'
    END AS type,
    COALESCE(p.album_id, p.song_id) AS content_id,
    COALESCE(a.name, s.name) AS name,
    COALESCE(a.cover_img, s.cover_img) AS cover_img
FROM posts p
LEFT JOIN albums a ON p.album_id = a.id
LEFT JOIN songs s ON p.song_id = s.id;
