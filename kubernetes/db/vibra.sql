CREATE TABLE IF NOT EXISTS "users" (
  "name" varchar PRIMARY KEY,
  "mail" varchar NOT NULL,
  "pass" varchar NOT NULL,
  "first_name" varchar NOT NULL,
  "surname" varchar NOT NULL,
  "profile_img" varchar,
  "role" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "follows" (
  "id" integer PRIMARY KEY,
  "created_at" timestamp NOT NULL,
  "follower" varchar NOT NULL,
  "followed" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "albums" (
  "id" integer PRIMARY KEY,
  "name" varchar NOT NULL,
  "cover_img" varchar,
  "date" timestamp,
  "user_name" varchar NOT NULL
);

CREATE TABLE IF NOT EXISTS "songs" (
  "id" integer PRIMARY KEY,
  "name" varchar NOT NULL,
  "cover_img" varchar,
  "date" timestamp,
  "audio" varchar NOT NULL,
  "user_name" varchar NOT NULL,
  "album_id" integer
);

CREATE TABLE IF NOT EXISTS "posts" (
  "id" integer PRIMARY KEY,
  "created_at" timestamp,
  "user_name" varchar NOT NULL,
  "album_id" integer,
  "song_id" integer
);

CREATE TABLE IF NOT EXISTS "reposts" (
  "id" integer PRIMARY KEY,
  "created_at" timestamp NOT NULL,
  "user_name" varchar NOT NULL,
  "post_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "rates" (
  "id" integer PRIMARY KEY,
  "rate" integer NOT NULL,
  "created_at" timestamp,
  "user_name" varchar NOT NULL,
  "post_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "saves" (
  "id" integer PRIMARY KEY,
  "created_at" timestamp NOT NULL,
  "user_name" varchar NOT NULL,
  "post_id" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "comments" (
  "id" integer PRIMARY KEY,
  "content" text NOT NULL,
  "likes" integer,
  "user_name" varchar NOT NULL,
  "post_id" integer NOT NULL,
  "comment_id" integer
);

ALTER TABLE "posts" ADD CONSTRAINT "user_name" FOREIGN KEY ("user_name") REFERENCES "users" ("name");

ALTER TABLE "albums" ADD CONSTRAINT "user_name" FOREIGN KEY ("user_name") REFERENCES "users" ("name");

ALTER TABLE "posts" ADD CONSTRAINT "album_id" FOREIGN KEY ("album_id") REFERENCES "albums" ("id");

ALTER TABLE "posts" ADD CONSTRAINT "song_id" FOREIGN KEY ("song_id") REFERENCES "songs" ("id");

ALTER TABLE "songs" ADD CONSTRAINT "album_id" FOREIGN KEY ("album_id") REFERENCES "albums" ("id");

ALTER TABLE "follows" ADD CONSTRAINT "follower" FOREIGN KEY ("follower") REFERENCES "users" ("name");

ALTER TABLE "follows" ADD CONSTRAINT "followed" FOREIGN KEY ("followed") REFERENCES "users" ("name");

ALTER TABLE "reposts" ADD CONSTRAINT "user_name" FOREIGN KEY ("user_name") REFERENCES "users" ("name");

ALTER TABLE "rates" ADD CONSTRAINT "user_name" FOREIGN KEY ("user_name") REFERENCES "users" ("name");

ALTER TABLE "saves" ADD CONSTRAINT "user_name" FOREIGN KEY ("user_name") REFERENCES "users" ("name");

ALTER TABLE "reposts" ADD CONSTRAINT "post_id" FOREIGN KEY ("post_id") REFERENCES "posts" ("id");

ALTER TABLE "rates" ADD CONSTRAINT "post_id" FOREIGN KEY ("post_id") REFERENCES "posts" ("id");

ALTER TABLE "saves" ADD CONSTRAINT "post_id" FOREIGN KEY ("post_id") REFERENCES "posts" ("id");

ALTER TABLE "comments" ADD CONSTRAINT "user_name" FOREIGN KEY ("user_name") REFERENCES "users" ("name");

ALTER TABLE "comments" ADD CONSTRAINT "post_id" FOREIGN KEY ("post_id") REFERENCES "posts" ("id");

ALTER TABLE "comments" ADD CONSTRAINT "comment_id" FOREIGN KEY ("comment_id") REFERENCES "comments" ("id");

-- VIEWS

-- SEARCH BAR VIEW
CREATE OR REPLACE VIEW search_view (name, id, type) AS
SELECT name, NULL::BIGINT AS id, 'user' AS type, profile_img AS img FROM users UNION ALL
SELECT name, id, 'song' AS type, cover_img AS img FROM songs UNION ALL
SELECT name, id, 'album' AS type, cover_img AS img FROM albums;

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
CREATE OR REPLACE VIEW user_page_view (name, profile_img, posts, followed, followers) AS
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

-- INSERTS

