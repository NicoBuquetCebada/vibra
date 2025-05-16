package service;

import java.util.List;

import io.smallrye.mutiny.Uni;
import model.Post;
import model.Repost;
import model.User;

public class RepostService {

	public static Uni<List<Repost>> getLatestRepostsOf(List<User> followed, Integer page, Integer pageSize) {
		return Post.find("userName IN ?1 ORDER BY createdAt DESC", followed)
			.page(page, pageSize)
			.list();
	}

}
