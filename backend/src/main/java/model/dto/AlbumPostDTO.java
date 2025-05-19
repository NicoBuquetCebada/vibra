package model.dto;

import java.util.List;

public class AlbumPostDTO {
	public String albumName;
	public String coverImg;
	public List<SongDTO> songs;

	public AlbumPostDTO(String albumName, String coverImg, List<SongDTO> songs) {
		this.albumName = albumName;
		this.coverImg = coverImg;
		this.songs = songs;
	}
}
