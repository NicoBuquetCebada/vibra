package service;

import java.util.List;

import exception.CustomAlreadyExistsException;
import exception.CustomNotFoundException;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.security.UnauthorizedException;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.core.Response;
import model.User;
import model.dto.AuthResponse;
import model.dto.Register;
import model.dto.Login;

public class UserService {

	//Information requests
	public static Uni<List<User>> getAllUsers() {
		return User.findAll().list();
	}
	
	public static Uni<User> getUserByName(String name) {
		return User.findByName(name)
			.onItem().ifNull()
			.failWith(new CustomNotFoundException("User not found: " + name));
	}

	public static Uni<User> getUserByMail(String mail) {
		return User.findByMail(mail)
			.onItem().ifNull()
			.failWith(new CustomNotFoundException("User not found: " + mail));
	}

	public static Uni<User> getUserByNameOrMail(String name, String mail) {
		return User.findByNameOrMail(name, mail)
			.onItem().ifNull()
			.failWith(new CustomNotFoundException("User not found: " + mail));
	}

	public static Uni<User> getUserByIdentifier(String identifier) {
		return getUserByName(identifier)
		.onFailure(CustomNotFoundException.class)
		.recoverWithUni(() -> getUserByMail(identifier));
	}

	
	//Authentication
	public static Uni<User> getUserByToken(SecurityIdentity securityIdentity) {
			String userName = securityIdentity.getPrincipal().getName();
			return getUserByName(userName);
	}

	public static Uni<Response> login(Login login) {
		return getUserByIdentifier(login.getIdentifier())
			.onItem().ifNotNull()
			.transformToUni(user -> {
				if (verifyPass(login.getPass(), user.pass)) {
					Response token = Response.ok(new AuthResponse(JWTService.generateToken(user.name, user.role))).build();
					return Uni.createFrom().item(token);
				} else {
					return Uni.createFrom().failure(new UnauthorizedException());
				}
			});
	}
	
	//Modification requests

	//Insert
	public static Uni<Response> insertUser(Register register) {
		return Panache.withTransaction(() -> {
			return getUserByNameOrMail(register.name, register.mail)
				.onItem().ifNotNull()
				.transformToUni(existingUser ->
					Uni.createFrom().<Response>failure(new CustomAlreadyExistsException("User name or mail already exists")))
				.onFailure(CustomNotFoundException.class)
				.recoverWithUni(() -> persistUser(register));
		});
	}

	public static Uni<Response> persistUser(Register register) {
		return User.persist(new User(register))
			.replaceWith(Response.status(201).build());
	}
	
	//Delete
	public static Uni<Response> deleteUserByName(String name) {
		return Panache.withTransaction(() -> {
			return User.deleteByName(name)
				.onItem()
				.transformToUni(deleted -> {
					if(deleted > 0) {
						return Uni.createFrom().item(Response.status(204).build());
					} else {
						return Uni.createFrom().failure(new CustomNotFoundException("User not found: " + name));
					}
				});
		});
	}

	//Update
	public static Uni<Response> updateUser(Register updated) {
		return Panache.withTransaction(() -> {
			return getUserByName(updated.name)
				.onItem().ifNotNull()
				.invoke(user -> {
					user.mail = updated.mail;
					user.firstName = updated.firstName;
					user.surname = updated.surname;
					user.pass = hashPass(updated.pass);
					user.profileImg = updated.profileImg;
					user.role = updated.role;
				})
				.onItem().ifNotNull()
				.transform(ignored -> Response.ok().build());
		});
	}

	//Passwords
	public static String hashPass(String plain) {
		return BcryptUtil.bcryptHash(plain, 10);
	}

	public static boolean verifyPass(String plain, String hashed) {
		return BcryptUtil.matches(plain, hashed);
	}

}