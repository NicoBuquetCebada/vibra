package model.dto;

import java.util.List;

public class AlbumDTO {

	public String name;
	public List<SongDTO> songs;

	public AlbumDTO(String name, List<SongDTO> songs) {
		this.name = name;
		this.songs = songs;
	}

}
