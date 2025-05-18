package service;

import java.util.List;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import model.Follow;
import model.User;

@ApplicationScoped
public class FollowService {

	public Uni<List<User>> getFollowed(User follower) {
		return Follow.list("follower", follower)
					.onItem().transform(followed -> {
						return followed.stream()
						.map(follow -> ((Follow)follow).followed).toList();
					});
	}
}
