package resource;

import java.util.List;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
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
import model.UserPage;
import model.dto.LoginDTO;
import model.dto.RegisterDTO;
import service.UserPageService;
import service.UserService;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

	@Inject SecurityIdentity securityIdentity;

	@Inject UserPageService ups;

	@Inject UserService us;


	@GET
	public Uni<List<User>> getAllUsers() {
		return us.getAllUsers();
	}

	@GET
	@Path("/{username}")
	public Uni<User> getUserByName(@PathParam("username") String name) {
		return us.getUserByName(name);
	}

	@POST
	@Path("/login")
	public Uni<Response> login(LoginDTO login) {
		return us.login(login);
	}

	@GET
	@Path("/token")
	public Uni<User> getUserName() {
		return us.getUserByToken(securityIdentity);
	}

	@POST
	@Path("/register")
	public Uni<Response> register(@Valid RegisterDTO register) {
		return us.insertUser(register);
	}

	@DELETE
	@Path("/{name}")
	public Uni<Response> deleteUserByName(@PathParam("name") String name) {
		return us.deleteUserByName(name);
	}

	@PUT
	public Uni<Response> updateUser(RegisterDTO register) {
		return us.updateUser(register);
	}

	@GET
	@Path("/page")
	@Authenticated
	public Uni<UserPage> getPage() {
		return ups.getPage(securityIdentity);
	}
	

}
