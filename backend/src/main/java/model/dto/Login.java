package model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class Login {
	
	@NotBlank
	@Size(min = 3, max = 20)
	@Pattern(regexp = "^[a-z0-9._]*$", message = "solo debe contener minusculas, numeros, puntos(.) y guiones bajos (_)")
	private String name;
	
	@NotBlank
	@Size(min = 8, max = 100)
	@Pattern(
		regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!])(?!.*\\s).{8,}$",
    	message = "debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial [@#$%^&+=!]"
	)
	private String pass;

	public Login(String name, String pass) {
		this.name = name;
		this.pass = pass;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPass() {
		return pass;
	}

	public void setPass(String pass) {
		this.pass = pass;
	}

}
