package service;

import java.time.LocalDateTime;
import java.util.List;

import exception.CustomNotFoundException;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import model.Follow;
import model.User;
import model.dto.UserDTO;

@ApplicationScoped
public class FollowService {

	@Inject UserService us;

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

	@WithTransaction
	public Uni<Response> follow(SecurityIdentity si, String userName) {
		return us.getUserByToken(si)
			.flatMap(follower -> {
				return us.getUserByName(userName)
					.flatMap(followed -> {
						return Follow.persist(new Follow(LocalDateTime.now(), follower, followed))
							.onItem().transform(ignore -> Response.status(201).build());
					});
			});
		}
		
	@WithTransaction
	public Uni<Response> unfollow(SecurityIdentity si, String userName) {
		return us.getUserByToken(si)
			.flatMap(follower -> {
				return Follow.delete("follower = ?1 AND followed.name = ?2", follower, userName)
					.onItem().transform(ignore -> Response.status(204).build());
			});
	}

	public Uni<Response> getFollow(SecurityIdentity si, String userName) {
		return us.getUserByToken(si)
			.flatMap(follower -> {
				return Follow.find("follower = ?1 AND followed.name = ?2", follower, userName).firstResult()
					.onItem().ifNotNull().transform(ignore -> Response.ok().build())
					.onItem().ifNull().failWith(new CustomNotFoundException(follower.name + " no sigue a: " + userName));
			});
	}
}
