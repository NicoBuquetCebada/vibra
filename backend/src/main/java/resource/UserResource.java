package resource;

import java.util.List;
import java.util.stream.Collectors;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import model.User;
import model.UserPage;
import model.UserPagePost;
import model.dto.LoginDTO;
import model.dto.PassChangeDTO;
import model.dto.RegisterDTO;
import service.RateService;
import service.SaveService;
import service.UserPageService;
import service.UserService;

@Path("/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserResource {

	@Inject SecurityIdentity securityIdentity;

	@Inject UserPageService ups;

	@Inject UserService us;

	@Inject RateService rs;

	@Inject SaveService ss;



	@GET // Only for dev tests
	public Uni<List<User>> getAllUsers() {
		return us.getAllUsers();
	}

	@POST
	@Path("/login")
	public Uni<Response> login(LoginDTO login) {
		return us.login(login);
	}

	@POST
	@Path("/register")
	public Uni<Response> register(@Valid RegisterDTO register) {
		return us.insertUser(register);
	}


	// Campos actualizables: mail y profileImg
	@PATCH
	@Path("update/{field}/{value}")
	@Authenticated
	public Uni<Response> updateField(@PathParam("field") String field, @PathParam("value") String value) {
		return us.updateField(securityIdentity, field, value);
	}

	@PATCH
	@Path("update/password")
	@Authenticated
	public Uni<Response> updatePass(PassChangeDTO dto) {
		return us.updatePass(securityIdentity, dto);
	}

	@DELETE
	@Path("/{name_name}")
	@Authenticated
	public Uni<Response> deleteUserByName(@PathParam("name_name") String name) {
		return us.deleteUserByName(name);
	}

	@GET
	@Path("/page")
	@Authenticated
	public Uni<UserPage> getPage() {
		return ups.getPage(securityIdentity);
	}
	
	@GET
	@Path("/page/{user_name}")
	@Authenticated
	public Uni<UserPage> getOthersPage(@PathParam("user_name") String userName) {
		return ups.getOthersPage(userName);
	}

	@GET
    @Path("/posts")
    public Uni<List<UserPagePost>> getUserPosts() {
        return ups.getPostsByUserToken(securityIdentity);
    }

	@GET
	@Path("/posts/{user_name}")
	public Uni<List<UserPagePost>> getOtherUserPosts(@PathParam("user_name") String userName) {
		return ups.getPostsByUserName(userName);
	}

	@GET
	@Path("/rates")
	public Uni<List<UserPagePost>> getUserRates() {
		return us.getUserByToken(securityIdentity)
			.flatMap(user ->
				rs.getRatesByUser(user.name)
					.map(rates -> rates.stream()
						.map(rate -> rate.post.id)
						.collect(Collectors.toList()))
					.<List<UserPagePost>>flatMap(postIds -> ups.getPostsByIdList(postIds))
			);
	}

	@GET
	@Path("/saves")
	public Uni<List<UserPagePost>> getUserSaves() {
		return us.getUserByToken(securityIdentity)
			.flatMap(user ->
				ss.getSavesByUser(user.name)
					.map(saves -> saves.stream()
						.map(save -> save.post.id)
						.collect(Collectors.toList()))
					.<List<UserPagePost>>flatMap(postIds -> ups.getPostsByIdList(postIds))
			);
	}
	

}
