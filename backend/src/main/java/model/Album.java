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
@Table(name = "albums")
public class Album extends PanacheEntity {

    @Column(length = 100, nullable = false)
    public String name;

	@Column(name = "cover_img")
    public String coverImg;

    public LocalDateTime date;
	
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

    public Album() {}

    public Album(String name, String coverImg, LocalDateTime date, User user) {
        this.name = name;
        this.coverImg = coverImg;
        this.date = date;
        this.user = user;
    }

}
