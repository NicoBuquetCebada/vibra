package model.dto;

import java.time.LocalDateTime;

import model.Post;
import model.Repost;

public class Home {

	public String type; // Post or repost
	public LocalDateTime createdAt;
	public UserDTO user; // User of the post itself
	public UserDTO repostUser; // The user that reposted
	public String content; // Song or Album
	public SongDTO song;
	public AlbumDTO album;
	public String coverImg;

	public Home(String type, LocalDateTime createdAt, UserDTO user, UserDTO repostUser, String content, SongDTO song,
			AlbumDTO album, String coverImg) {
		this.type = type;
		this.createdAt = createdAt;
		this.user = user;
		this.repostUser = repostUser;
		this.content = content;
		this.song = song;
		this.album = album;
		this.coverImg = coverImg;
	}

	public Home(Post post, Repost repost) {
		if (post != null) {
			this.type = "post";
			this.createdAt = post.createdAt;
			this.user = new UserDTO(post.userName);
			this.repostUser = null;
			this.content = null;
			this.song = null;
			this.album = null;
			this.coverImg = null;
		} else {
			this.type = "repost";
			this.createdAt = repost.createdAt;
			this.user = new UserDTO(repost.postId.userName);
			this.repostUser = new UserDTO(repost.userName);
			this.content = null;
			this.song = null;
			this.album = null;
			this.coverImg = null;
		}
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

}
