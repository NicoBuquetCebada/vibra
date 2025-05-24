package model;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_page_posts_view")
public class UserPagePost extends PanacheEntityBase {

    @Id
    public Long id; // ID del post

    @Column(name = "user_name")
    public String userName;

    @Column(name = "created_at")
    public java.time.LocalDateTime createdAt;

    public String type; // "song" o "album"

    @Column(name = "content_id")
    public Long contentId;

    public String name;

    @Column(name = "cover_img")
    public String coverImg;

    // Constructor vacío requerido
    public UserPagePost() {}
}