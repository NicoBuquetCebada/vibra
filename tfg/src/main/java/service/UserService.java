package service;

import exception.CustomNotFoundException;
import io.quarkus.security.UnauthorizedException;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.core.Response;
import model.User;
import model.dto.AuthResponse;
import model.dto.Login;

public class UserService {

	public static Uni<User> getUserByName(String name) {
		return User.findByName(name)
			.onItem().ifNotNull()
			.transformToUni(user -> {
				return Uni.createFrom().item(user);
			})
			.onItem().ifNull()
			.failWith(new CustomNotFoundException("User not found: " + name));
	}

	public static Uni<User> insertUser(User user) {
		return User.findByName(user.name)
			.onItem().transformToUni(u -> {
				if (u != null) {
					
				}
			})
	}

	public static Uni<Response> login(Login login) {
		return getUserByName(login.getName())
			.onItem().ifNotNull()
			.transformToUni(user -> {
				if (login.getPass().equals(user.pass)) {
					Response token = Response.ok(new AuthResponse(JWTService.generateToken(user.name, user.role))).build();
					return Uni.createFrom().item(token);
				} else {
					return Uni.createFrom().failure(new UnauthorizedException());
				}
			});
	}

	public static Uni<User> getUserByToken(SecurityIdentity securityIdentity) {
		String userName = securityIdentity.getPrincipal().getName();
		return getUserByName(userName);
	}
}
