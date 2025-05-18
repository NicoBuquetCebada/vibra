package service;

import java.util.List;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import model.Repost;
import model.User;

@ApplicationScoped
public class RepostService {

	public Uni<List<Repost>> getLatestRepostsOf(List<User> followed, Integer page, Integer pageSize) {
		return Repost.find("userName IN ?1 ORDER BY createdAt DESC", followed)
			.page(page, pageSize)
			.list();
	}

}
