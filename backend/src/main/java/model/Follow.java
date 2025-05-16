package model;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import io.smallrye.mutiny.Uni;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "follows")
public class Follow extends PanacheEntity {

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt;

    @ManyToOne
	@JoinColumn(name = "follower", nullable = false)
    public User follower;

    @ManyToOne
	@JoinColumn(name = "followed", nullable = false)
    public User followed;

    public Follow() {}

    public Follow(LocalDateTime createdAt, User follower, User followed) {
        this.createdAt = createdAt;
        this.follower = follower;
        this.followed = followed;
    }

}
