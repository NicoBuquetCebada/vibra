package model.dto;

public class PostDTO {
	public String content;
	public String coverImg;
	public AlbumDTO album;
	public SongDTO song;

	public PostDTO(String content, String coverImg, AlbumDTO album, SongDTO song) {
		this.content = content;
		this.coverImg = coverImg;
		this.album = album;
		this.song = song;
	}
	
}
