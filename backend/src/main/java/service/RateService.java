package service;

import java.time.LocalDateTime;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import model.Rate;
import model.User;
import model.dto.RateDTO;

@ApplicationScoped
public class RateService {

	@Inject UserService us;

	@Inject PostService ps;

	@WithTransaction
	public Uni<Response> ratePost(SecurityIdentity si, RateDTO rate) {
		return us.getUserByToken(si)
			.flatMap(user -> {
				return ps.getPostById(rate.postId)
					.<Response>flatMap(post -> 
						Rate.persist(new Rate(rate.rate, LocalDateTime.now(), user, post))
							.onItem().transform(ignore -> Response.status(201).build())
					);
			});
	}

	@WithTransaction
	public Uni<Response> updateRate(SecurityIdentity si, RateDTO rate) {
		return us.getUserByToken(si)
			.flatMap(user -> 
				Rate.update("rate = ?1 WHERE post.id = ?2 AND user = ?3", 
					rate.rate, rate.postId, user)
					.onItem().transform(ignore -> Response.ok().build())
			);
	}

	@WithTransaction
	public Uni<Response> deleteRate(SecurityIdentity si, Long post) {
		return us.getUserByToken(si)
			.flatMap(user ->
				Rate.delete("post.id = ?1 AND user = ?2", post, user)
					.onItem().transform(ignore -> Response.status(204).build())
			);
	}

	public Uni<Rate> getRatesByPost(Long post, User user) {
		return Rate.find("post.id = ?1 AND user = ?2", post, user).firstResult();
	}

}
