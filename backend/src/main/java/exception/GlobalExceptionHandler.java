package exception;

import io.quarkus.security.UnauthorizedException;
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
		} else {
			return Response
				.status(Response.Status.INTERNAL_SERVER_ERROR)
				.entity(new Stack(e.getStackTrace()))
				.build();
		}
	}
}
