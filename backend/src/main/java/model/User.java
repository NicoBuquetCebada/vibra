package model;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import io.smallrye.mutiny.Uni;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "users")
public class User extends PanacheEntityBase {
	
	@Id
	@NotBlank
	@Size(min = 3, max = 20)
	@Pattern(regexp = "^[a-z0-9._]*$", message = "debe contener solo minusculas, numeros, puntos(.) y guiones bajos (_)")
	public String name;

	@Column(length = 100, nullable = false, unique = true)
	@NotBlank
	@Size(min = 10, max = 100)
	@Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "no válido")
	public String mail;

	@Column(name = "first_name", length = 25, nullable = false)
	@NotBlank
	@Size(min = 3, max = 25)
	public String firstName;

	@Column(length = 25, nullable = false)
	@NotBlank
	@Size(min = 3, max = 25)
	public String surname;
	
	@Column(length = 100, nullable = false)
	@NotBlank
	@Size(min = 8, max = 100)
	@Pattern(
		regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!])(?!.*\\s).{8,}$",
    	message = "debe tener al menos una mayúscula, una minúscula, un número y un carácter especial [@#$%^&+=!]"
	)
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
