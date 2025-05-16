package model.dto;

import model.User;

public class UserDTO {

	public String name;
	public String profileImg;
	
	public UserDTO(User user) {
		this.name = user.name;
		this.profileImg = user.profileImg;
	}
	
}
