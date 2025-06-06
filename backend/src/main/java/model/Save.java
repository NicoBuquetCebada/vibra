package model;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "saves")
public class Save extends PanacheEntity {

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt;

    @ManyToOne
	@JoinColumn(name = "user_name", nullable = false)
    public User user;

    @ManyToOne
	@JoinColumn(name = "post_id", nullable = false)
    public Post post;

    public Save() {}

    public Save(LocalDateTime createdAt, User user, Post post) {
        this.createdAt = createdAt;
        this.user = user;
        this.post = post;
    }
}
