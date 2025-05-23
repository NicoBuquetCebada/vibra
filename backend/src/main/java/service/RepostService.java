package service;

import java.time.LocalDateTime;
import java.util.List;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import model.Repost;
import model.User;

@ApplicationScoped
public class RepostService {

	@Inject UserService us;

	@Inject PostService ps;

	public Uni<List<Repost>> getLatestRepostsOf(List<User> followed, Integer page, Integer pageSize) {
		return Repost.find("user IN ?1 ORDER BY createdAt DESC", followed)
			.page(page, pageSize)
			.list();
	}

	public Uni<Repost> getRespostByPost(Long post, User user) {
		return Repost.find("post.id = ?1 AND user = ?2", post, user).firstResult();
	}

	@WithTransaction
	public Uni<Response> repostPost(SecurityIdentity si, Long postId) {
		return us.getUserByToken(si)
			.flatMap(user -> {
				return ps.getPostById(postId)
					.<Response>flatMap(post -> 
						Repost.persist(new Repost(LocalDateTime.now(), user, post))
							.onItem().transform(ignore -> Response.status(201).build())
					);
			});
	}
	
	@WithTransaction
    public Uni<Response> deleteRepost(SecurityIdentity si, Long post) {
        return us.getUserByToken(si)
			.flatMap(user ->
				Repost.delete("post.id = ?1 AND user = ?2", post, user)
					.onItem().transform(ignore -> Response.status(204).build())
			);
    }

}
