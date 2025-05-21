package exception;

import org.jose4j.jwt.consumer.InvalidJwtException;

import io.quarkus.security.UnauthorizedException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class GlobalExceptionHandler implements ExceptionMapper<Exception> {
	
	@Override
	public Response toResponse(Exception e) {
		if (e instanceof CustomNotFoundException) {
			return Response
				.status(Response.Status.NOT_FOUND)
				.entity(new ErrorResponse(e.getMessage(), 404))
				.build();
		} else if (e instanceof IllegalArgumentException) {
			return Response
				.status(Response.Status.BAD_REQUEST)
				.entity(new ErrorResponse("Invalid data", 400))
				.build();
		} else if (e instanceof UnauthorizedException) {
			return Response
				.status(Response.Status.UNAUTHORIZED)
				.entity(new ErrorResponse("Unauthorized", 401))
				.build();
		} else if (e instanceof CustomAlreadyExistsException) {
			return Response
				.status(Response.Status.BAD_REQUEST)
				.entity(new ErrorResponse(e.getMessage(), 400))
				.build();
		} else if (e instanceof WebApplicationException) {
			return Response
				.status(Response.Status.BAD_REQUEST)
				.entity(new ErrorResponse("Invalid Json", 400))
				.build();
		} else if (e instanceof InvalidJwtException) {
			return Response
				.status(Response.Status.UNAUTHORIZED)
				.entity(new ErrorResponse("JWT: The authentication token has expired", 401))
				.build();
		} else {
			throw new RuntimeException(e);
		}
	}
}
