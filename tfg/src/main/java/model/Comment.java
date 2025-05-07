package model;

import org.hibernate.mapping.Join;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "comments")
public class Comment extends PanacheEntity {

    @Column(nullable = false)
    public String content;

    public Integer likes;

	@ManyToOne
	@JoinColumn(name = "user_name", nullable = false)
	public User userName;

    @ManyToOne
	@JoinColumn(name = "post_id", nullable = false)
    public Post postId;

	@ManyToOne
	@JoinColumn(name = "comment_id", nullable = true)
    public Comment commentId;

    public Comment() {}

    public Comment(String content, Integer likes, Post postId, Comment commentId) {
        this.content = content;
        this.likes = likes;
        this.postId = postId;
        this.commentId = commentId;
    }
}
