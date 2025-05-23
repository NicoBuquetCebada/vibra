package model;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "rates")
public class Rate extends PanacheEntity {

    @Column(nullable = false)
    public Integer rate;

	@Column(name = "created_at")
    public LocalDateTime createdAt;

    @ManyToOne
	@JoinColumn(name = "user_name", nullable = false)
    public User user;

    @ManyToOne
	@JoinColumn(name = "post_id", nullable = false)
    public Post post;

    public Rate() {}

    public Rate(Integer rate, LocalDateTime createdAt, User user, Post post) {
        this.rate = rate;
        this.createdAt = createdAt;
        this.user = user;
        this.post = post;
    }
}
