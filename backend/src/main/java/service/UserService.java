package service;

import java.util.List;


import exception.CustomAlreadyExistsException;
import exception.CustomNotFoundException;
import io.quarkus.cache.CacheInvalidate;
import io.quarkus.cache.CacheInvalidateAll;
import io.quarkus.cache.CacheResult;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.quarkus.security.UnauthorizedException;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.Response;
import model.User;
import model.dto.AuthResponseDTO;
import model.dto.RegisterDTO;
import model.dto.LoginDTO;
import model.dto.PassChangeDTO;

@ApplicationScoped
public class UserService {

	// User of constructor
	public User userOfRegister(RegisterDTO register) {
		String hashedPass = hashPass(register.pass);
		return new User(register.name, register.firstName, register.surname, register.mail, hashedPass, "http://localhost:8080/media/defaultu.png", "user");
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

	@CacheResult(cacheName = "user-by-mail")
	public Uni<User> getUserByMail(String mail) {
		return User.<User>find("mail", mail).firstResult()
			.onItem().ifNull()
			.failWith(new CustomNotFoundException("User not found: " + mail));
	}

	@CacheResult(cacheName = "user-by-name-or-mail")
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
	@CacheInvalidate(cacheName = "user-by-name")
	@CacheInvalidate(cacheName = "user-by-mail")
	@CacheInvalidate(cacheName = "user-by-name-or-mail")
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
	@CacheInvalidateAll(cacheName = "user-by-name")
	@CacheInvalidateAll(cacheName = "user-by-mail")
	@CacheInvalidateAll(cacheName = "user-by-name-or-mail")
	public Uni<Response> updateUser(RegisterDTO updated) {
		return Panache.withTransaction(() -> {
			return getUserByName(updated.name)
				.onItem().ifNotNull()
				.invoke(user -> {
					user.mail = updated.mail;
					user.firstName = updated.firstName;
					user.surname = updated.surname;
					user.pass = hashPass(updated.pass);
					user.profileImg = "http://localhost:8080/media/defaultu";
					user.role = "user";
				})
				.onItem().ifNotNull()
				.transform(ignored -> Response.ok().build());
		});
	}

	@WithTransaction
	@CacheInvalidateAll(cacheName = "user-by-name")
	@CacheInvalidateAll(cacheName = "user-by-mail")
	@CacheInvalidateAll(cacheName = "user-by-name-or-mail")
    public Uni<Response> updateField(SecurityIdentity si, String field, String value) {
        return getUserByToken(si)
            .flatMap(user -> {
                switch (field.toLowerCase()) {
                    case "mail":
                        if (!isValidMail(value)) {
                            return Uni.createFrom().failure(
                                new IllegalArgumentException("Email inválido")
                            );
                        }
                        return User.update("mail = ?1 WHERE name = ?2", value, user.name)
                            .map(updated -> Response.ok().build());
                    
                    case "profileimg":
                        return User.update("profileImg = ?1 WHERE name = ?2", value, user.name)
                            .map(updated -> Response.ok().build());
                    
                    default:
                        return Uni.createFrom().failure(
                            new IllegalArgumentException("Campo no actualizable")
                        );
                }
            });
    }

	@WithTransaction
	@CacheInvalidateAll(cacheName = "user-by-name")
	@CacheInvalidateAll(cacheName = "user-by-mail")
	@CacheInvalidateAll(cacheName = "user-by-name-or-mail")
	public Uni<Response> updatePass(SecurityIdentity si, PassChangeDTO dto) {
		return getUserByToken(si)
			.flatMap(user -> {
				if (!verifyPass(dto.oldPass, user.pass)) {
					return Uni.createFrom().failure(new UnauthorizedException());
				}
				String hashedPass = hashPass(dto.newPass);
				return User.update("pass = ?1 WHERE name = ?2", hashedPass, user.name)
					.map(ignore -> Response.ok().build());
			});
	}

	// Validation
	public boolean isValidMail(String mail) {
		String regex = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
		return mail.matches(regex);
	}

	//Passwords
	public String hashPass(String plain) {
		return BcryptUtil.bcryptHash(plain, 10);
	}

	public static boolean verifyPass(String plain, String hashed) {
		return BcryptUtil.matches(plain, hashed);
	}

}