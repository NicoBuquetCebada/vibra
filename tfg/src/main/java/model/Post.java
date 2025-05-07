package model;

import java.util.Date;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "posts")
public class Post extends PanacheEntity {

	@Column(name = "created_at", nullable = false)
	public Date createdAt;

	@ManyToOne
	@JoinColumn(name = "user_name", nullable = false)
	public User userName;
	
	@ManyToOne
	@JoinColumn(name = "album_id", nullable = true)
	public Album albumId;

	@ManyToOne
	@JoinColumn(name = "song_id", nullable = true)
	public Song songId;

	public Post() {}

	public Post(Date createdAt, User userName, Album albumId, Song songId) {
		this.createdAt = createdAt;
		this.userName = userName;
		this.albumId = albumId;
		this.songId = songId;
	}

}
