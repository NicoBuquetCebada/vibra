package service;

import java.time.Duration;

import io.smallrye.jwt.build.Jwt;

public class JWTService {

	public static String generateToken(String userName, String role) {
		return Jwt
			.issuer("https://vibra.com") // emisor
			.subject(userName) // usuario
			.groups(role) // roles (ej: user, admin)
			.expiresIn(Duration.ofDays(10)) // expiración
			.sign(); // firma con la clave privada
	}

}
