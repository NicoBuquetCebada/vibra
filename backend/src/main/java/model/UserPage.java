package model;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_page_view")
public class UserPage extends PanacheEntityBase {

	@Id
	public String name;

	public String profile_img;
	public Integer posts;
	public Integer followed;
	public Integer followers;
}
