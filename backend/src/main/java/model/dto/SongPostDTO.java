package model.dto;

public class SongPostDTO {
	public String songName;
	public String coverImg;
	public String audio;

	public SongPostDTO(String songName, String coverImg, String audio) {
		this.songName = songName;
		this.coverImg = coverImg;
		this.audio = audio;
	}
	
}
