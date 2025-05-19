package service;

import java.util.List;

import exception.CustomAlreadyExistsException;
import exception.CustomNotFoundException;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.security.UnauthorizedException;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.Response;
import model.User;
import model.dto.AuthResponseDTO;
import model.dto.RegisterDTO;
import model.dto.LoginDTO;

@ApplicationScoped
public class UserService {

	// User of constructor
	public User userOfRegister(RegisterDTO register) {
		String hashedPass = hashPass(register.pass);
		return new User(register.name, register.firstName, register.surname, register.mail, hashedPass, register.profileImg, register.profileImg);
	}

	//Information requests
	public Uni<List<User>> getAllUsers() {
		return User.findAll().list();
	}
	
	public Uni<User> getUserByName(String name) {
		return User.<User>find("name", name).firstResult()
			.onItem().ifNull()
			.failWith(new CustomNotFoundException("User not found: " + name));
	}

	public Uni<User> getUserByMail(String mail) {
		return User.<User>find("mail", mail).firstResult()
			.onItem().ifNull()
			.failWith(new CustomNotFoundException("User not found: " + mail));
	}

	public Uni<User> getUserByNameOrMail(String name, String mail) {
		return User.<User>find("name = ?1 OR mail = ?2", name, mail).firstResult()
			.onItem().ifNull()
			.failWith(new CustomNotFoundException("User not found: " + mail));
	}

	public Uni<User> getUserByIdentifier(String identifier) {
		return getUserByName(identifier)
		.onFailure(CustomNotFoundException.class)
		.recoverWithUni(() -> getUserByMail(identifier));
	}

	
	//Authentication
	public Uni<User> getUserByToken(SecurityIdentity securityIdentity) {
			String userName = securityIdentity.getPrincipal().getName();
			return getUserByName(userName);
	}

	public Uni<Response> login(LoginDTO login) {
		return getUserByIdentifier(login.getIdentifier())
			.onItem().ifNotNull()
			.transformToUni(user -> {
				if (verifyPass(login.getPass(), user.pass)) {
					Response token = Response.ok(new AuthResponseDTO(JWTService.generateToken(user.name, user.role))).build();
					return Uni.createFrom().item(token);
				} else {
					return Uni.createFrom().failure(new UnauthorizedException());
				}
			});
	}
	
	//Modification requests

	//Insert
	public Uni<Response> insertUser(RegisterDTO register) {
		return Panache.withTransaction(() -> {
			return getUserByNameOrMail(register.name, register.mail)
				.onItem().ifNotNull()
				.transformToUni(existingUser ->
					Uni.createFrom().<Response>failure(new CustomAlreadyExistsException("User name or mail already exists")))
				.onFailure(CustomNotFoundException.class)
				.recoverWithUni(() -> persistUser(register));
		});
	}

	public Uni<Response> persistUser(RegisterDTO register) {
		return User.persist(userOfRegister(register))
			.replaceWith(Response.status(201).build());
	}
	
	//Delete
	public Uni<Response> deleteUserByName(String name) {
		return Panache.withTransaction(() -> {
			return User.delete("name", name)
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
	public Uni<Response> updateUser(RegisterDTO updated) {
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
	public String hashPass(String plain) {
		return BcryptUtil.bcryptHash(plain, 10);
	}

	public static boolean verifyPass(String plain, String hashed) {
		return BcryptUtil.matches(plain, hashed);
	}

}