package service;

import java.time.LocalDateTime;
import java.util.List;

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

	public Uni<Rate> getRatesByPost(Long post, User user) {
		return Rate.find("post.id = ?1 AND user = ?2", post, user).firstResult();
	}
}
