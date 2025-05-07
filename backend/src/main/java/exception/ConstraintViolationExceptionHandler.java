package exception;

import java.util.List;

import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class ConstraintViolationExceptionHandler implements ExceptionMapper<ConstraintViolationException> {

	@Override
	public Response toResponse(ConstraintViolationException cve) {
		List<String> errors = cve.getConstraintViolations()
			.stream()
			.map(v -> v.getPropertyPath() + ": " + v.getMessage())
			.toList();

		return Response
			.status(Response.Status.BAD_REQUEST)
			.entity(new ErrorResponse("Constraint validation failed", 400, errors))
			.build();
	}

}
