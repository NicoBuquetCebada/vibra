package model;

import java.time.LocalDateTime;


import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications_view")
public class Notification extends PanacheEntityBase {

	@Id
	public String type;

	@Column(name = "created_at")
	public LocalDateTime createdAt;

	@Column(name = "action_user")
	public String actionUserName;

	@Column(name = "profile_img")
	public String profileImg;

	@Column(name = "content_user")
	public String contentUserName;

	@Column(name = "content_id")
	public Long contentId;

	public Notification() {}

}
