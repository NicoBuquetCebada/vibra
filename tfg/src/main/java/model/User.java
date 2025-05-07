package model;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import io.smallrye.mutiny.Uni;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User extends PanacheEntityBase {
	
	@Id
	public String name;
	
	@Column(length = 100, nullable = false)
	public String mail;

	@Column(name = "first_name", length = 25, nullable = false)
	public String firstName;

	@Column(length = 25, nullable = false)
	public String surname;
	
	@Column(length = 100, nullable = false)
	public String pass;
	
	@Column(name = "profile_img")
	public String profileImg;

	@Column(length = 25, nullable = false)
	public String role;

	public User () {}
	
	public User(String name, String mail, String pass, String profileImg) {
		this.name = name;
		this.mail = mail;
		this.pass = pass;
		this.profileImg = profileImg;
	}

	// Specific query methods
	public static Uni<User> findByName(String name) {
		return find("name", name).firstResult();
	}

}
