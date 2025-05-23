package service;

import java.time.LocalDateTime;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import model.Rate;
import model.Save;
import model.User;
import model.dto.RateDTO;

@ApplicationScoped
public class SaveService {
	
	@Inject UserService us;

	@Inject PostService ps;

	@WithTransaction
	public Uni<Response> savePost(SecurityIdentity si, Long post) {
		return us.getUserByToken(si)
			.flatMap(user -> {
				return ps.getPostById(post)
					.<Response>flatMap(p -> 
						Save.persist(new Save(LocalDateTime.now(), user, p))
							.onItem().transform(ignore -> Response.status(201).build())
					);
			});
	}

	public Uni<Save> getSaveByPost(Long post, User user) {
		return Save.find("post.id = ?1 AND user = ?2", post, user).firstResult();
	}
}
