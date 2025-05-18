package model.dto;

import java.time.LocalDateTime;

public class HomeDTO {

	public String type; // Post or repost
	public LocalDateTime createdAt;
	public UserDTO user; // User of the post itself
	public UserDTO repostUser; // The user that reposted
	public String content; // Song or Album
	public SongDTO song;
	public AlbumDTO album;
	public String coverImg;

	public HomeDTO(String type, LocalDateTime createdAt, UserDTO user, UserDTO repostUser, String content, SongDTO song,
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


	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

}
