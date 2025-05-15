package resource;

import java.util.List;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.transaction.TransactionScoped;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import model.User;
import model.dto.Login;
import model.dto.Register;
import service.UserService;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

	@Inject
	SecurityIdentity securityIdentity;

	@GET
	public Uni<List<User>> getAllUsers() {
		return UserService.getAllUsers();
	}

	@GET
	@Path("/{username}")
	public Uni<User> getUserByName(@PathParam("username") String name) {
		return UserService.getUserByName(name);
	}

	@POST
	public Uni<Response> login(Login login) {
		return UserService.login(login);
	}

	@GET
	@Path("/token")
	public Uni<User> getUserName() {
		return UserService.getUserByToken(securityIdentity);
	}

	@POST
	@Path("/register")
	public Uni<Response> register(@Valid Register register) {
		return UserService.insertUser(register);
	}

	@DELETE
	@Path("/{name}")
	public Uni<Response> deleteUserByName(@PathParam("name") String name) {
		return UserService.deleteUserByName(name);
	}

	@PUT
	public Uni<Response> updateUser(Register register) {
		return UserService.updateUser(register);
	}
	

}
