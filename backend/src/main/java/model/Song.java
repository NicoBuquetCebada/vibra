package model;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "songs")
public class Song extends PanacheEntity {

    @Column(length = 100, nullable = false)
    public String name;

	@Column(name = "cover_img")
    public String coverImg;

    public LocalDateTime date;

    @Column(nullable = false)
    public String audio;

    @ManyToOne
	@JoinColumn(name = "user_name", nullable = false)
    public User user;

	@JsonProperty("user")
	public String getJsonUser() {
		return user.name;
	}

	@JsonIgnore
	public User getUser() {
		return user;
	}

	@ManyToOne
	@JoinColumn(name = "album_id", nullable = true)
    public Album album;

	/* @JsonProperty("album")
	public String getJsonAlbum() {
		if (album != null) {
			return album.name;
		}
		return null;
	}

	@JsonIgnore
	public Album getAlbum() {
		return album;
	} */

    public Song() {}

    public Song(String name, String coverImg, LocalDateTime date, String audio, User user, Album album) {
        this.name = name;
        this.coverImg = coverImg;
        this.date = date;
        this.audio = audio;
        this.user = user;
        this.album = album;
    }

}
