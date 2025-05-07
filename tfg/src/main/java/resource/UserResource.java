package resource;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import model.User;
import model.dto.Login;
import service.UserService;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

	@Inject
	SecurityIdentity securityIdentity;

	@GET
	@Path("/{name}")
	public Uni<User> getUserByName(@PathParam("name") String name) {
		return UserService.getUserByName(name);
	}

	@POST
	@Authenticated
	public Uni<Response> login(Login login) {
		return UserService.login(login);
	}

	@GET
	public Uni<User> getUserName() {
		return UserService.getUserByToken(securityIdentity);
	}

}
