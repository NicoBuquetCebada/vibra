package model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class PassChangeDTO {

	public String oldPass;

	@NotBlank
	@Size(min = 8, max = 100)
	@Pattern(
		regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&+=!.])(?!.*\\s).{8,}$",
    	message = "debe tener al menos una mayúscula, una minúscula, un número y un carácter especial [@#$%^&+=!]"
	)
	public String newPass;
}
