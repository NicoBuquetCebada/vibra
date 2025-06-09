package model.dto;

import model.User;

public class UserDTO {

	public String name;
	public String profileImg;
	public String mail;
	
	public UserDTO(User user) {
		this.name = user.name;
		this.profileImg = user.profileImg;
		this.mail = user.mail;
	}
	
}
