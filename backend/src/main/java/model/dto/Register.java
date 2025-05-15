package model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class Register {

	@NotBlank
	@Size(min = 3, max = 20)
	@Pattern(regexp = "^[a-z0-9._]*$", message = "debe contener solo minusculas, numeros, puntos(.) y guiones bajos (_)")
	public String name;

	@NotBlank
	@Size(min = 10, max = 100)
	@Pattern(regexp = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$", message = "no válido")
	public String mail;

	@NotBlank
	@Size(min = 3, max = 25)
	public String firstName;

	@NotBlank
	@Size(min = 3, max = 25)
	public String surname;
	
	@NotBlank
	@Size(min = 8, max = 100)
	@Pattern(
		regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!.])(?!.*\\s).{8,}$",
    	message = "debe tener al menos una mayúscula, una minúscula, un número y un carácter especial [@#$%^&+=!]"
	)
	public String pass;

	public String profileImg;

	public String role;

	public Register() {}
}
