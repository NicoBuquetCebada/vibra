package service;

import java.util.List;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import model.Follow;
import model.User;
import model.dto.UserDTO;

@ApplicationScoped
public class FollowService {

	public Uni<List<User>> getFollowed(User follower) {
		return Follow.list("follower", follower)
			.onItem().transform(followed -> {
				return followed.stream()
				.map(follow -> ((Follow)follow).followed).toList();
			});
	}

	public Uni<List<UserDTO>> getFollowedDTO(User follower) {
		return Follow.list("follower", follower)
			.onItem().transform(followed -> {
				return followed.stream()
				.map(follow -> new UserDTO(((Follow)follow).followed)).toList();
			});
	}

	public Uni<List<UserDTO>> getFollowersDTO(User followed) {
		return Follow.list("followed", followed)
			.onItem().transform(f -> {
				return f.stream()
				.map(follow -> new UserDTO(((Follow)follow).follower)).toList();
			});
	}
}
