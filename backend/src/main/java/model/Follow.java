package model;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "follows")
public class Follow extends PanacheEntity {

    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt;

    @ManyToOne
	@JoinColumn(name = "user1", nullable = false)
    public User user1;

    @ManyToOne
	@JoinColumn(name = "user2", nullable = false)
    public User user2;

    public Follow() {}

    public Follow(LocalDateTime createdAt, User user1, User user2) {
        this.createdAt = createdAt;
        this.user1 = user1;
        this.user2 = user2;
    }
}
