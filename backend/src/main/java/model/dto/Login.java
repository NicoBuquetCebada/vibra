package model.dto;

import jakarta.validation.constraints.NotBlank;

public class Login {
	
	@NotBlank
	private String identifier;
	
	@NotBlank
	private String pass;

	public Login(String identifier, String pass) {
		this.identifier = identifier;
		this.pass = pass;
	}

	public String getIdentifier() {
		return identifier;
	}

	public void setIdentifier(String identifier) {
		this.identifier = identifier;
	}

	public String getPass() {
		return pass;
	}

	public void setPass(String pass) {
		this.pass = pass;
	}

}
