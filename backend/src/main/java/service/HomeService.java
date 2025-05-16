package service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import model.Post;
import model.Repost;
import model.User;
import model.dto.Home;

public class HomeService {

	public static Uni<List<Home>> getHome(SecurityIdentity si, Integer page, Integer pageSize) {
		return UserService.getUserByToken(si)
			.flatMap(user -> FollowService.getFollowed(user)
				.flatMap(followed -> getHomeObjects(followed, page, pageSize))
			);
	}

	public static Uni<List<Home>> getHomeObjects(List<User> followed, Integer page, Integer pageSize) {
		if (followed.isEmpty()) {
			return Uni.createFrom().item(List.of());
		}

		Uni<List<Post>> posts = PostService.getLatestPostsOf(followed, page, pageSize);
		Uni<List<Repost>> reposts = RepostService.getLatestRepostsOf(followed, page, pageSize);

		return Uni.combine().all().unis(posts, reposts)
			.with((p, r) -> {
				List<Home> items = new ArrayList<>();

				for (Post post : p) {
					items.add(new Home(post, null));
				}
				for (Repost repost: r) {
					items.add(new Home(null, repost));
				}

				return items.stream()
					.sorted(Comparator.comparing(Home::getCreatedAt).reversed())
					.toList();
			});
	}

}
