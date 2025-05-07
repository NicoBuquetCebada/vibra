package model;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

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
    public User userName;

	@ManyToOne
	@JoinColumn(name = "album_id", nullable = true)
    public Album albumId;

    public Song() {}

    public Song(String name, String coverImg, LocalDateTime date, String audio, User userName, Album albumId) {
        this.name = name;
        this.coverImg = coverImg;
        this.date = date;
        this.audio = audio;
        this.userName = userName;
        this.albumId = albumId;
    }
}
