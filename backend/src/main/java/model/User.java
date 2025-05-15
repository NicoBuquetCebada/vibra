package model;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import io.smallrye.mutiny.Uni;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import model.dto.Register;
import service.UserService;

@Entity
@Table(name = "users")
public class User extends PanacheEntityBase {
	
	@Id
	public String name;

	@Column(length = 100, nullable = false, unique = true)
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
	
	public User(String name, String firstName, String surname, String mail, String pass, String profileImg, String role) {
		this.name = name;
		this.firstName = firstName;
		this.surname = surname;
		this.mail = mail;
		this.pass = pass;
		this.profileImg = profileImg;
		this.role = role;
	}

	public User(Register register) {
		this.name = register.name;
		this.firstName = register.firstName;
		this.surname = register.surname;
		this.mail = register.mail;
		this.pass = UserService.hashPass(register.pass);
		this.profileImg = register.profileImg;
		this.role = register.role;
	}
	
	// Specific query methods
	public static Uni<User> findByName(String name) {
		return find("name", name).firstResult();
	}

	public static Uni<User> findByMail(String mail) {
		return find("mail", mail).firstResult();
	}

	public static Uni<User> findByNameOrMail(String name, String mail) {
		return find("name = ?1 OR mail = ?2", name, mail).firstResult();
	}

	public static Uni<Long> deleteByName(String name) {
		return delete("name", name);
	}

}
