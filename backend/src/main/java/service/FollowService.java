package service;

import java.util.List;

import io.smallrye.mutiny.Uni;
import model.Follow;
import model.User;

public class FollowService {

	public static Uni<List<User>> getFollowed(User follower) {
		return Follow.list("follower", follower)
					.onItem().transform(followed -> {
						return followed.stream()
						.map(follow -> ((Follow)follow).followed).toList();
					});
	}
}
