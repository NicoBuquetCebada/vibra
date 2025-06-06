package resource;

import java.util.List;

import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import model.dto.UserDTO;
import service.FollowService;
import service.UserService;

@Path("/follows")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class FollowResource {

	@Inject SecurityIdentity si;

	@Inject FollowService fs;

	@Inject UserService us;

	@GET
	@Path("/followed")
	public Uni<List<UserDTO>> getFollowedUsers() {
		return us.getUserByToken(si)
			.flatMap(user -> fs.getFollowedDTO(user));
	}

	@GET
	@Path("/followed/{user_name}")
	public Uni<List<UserDTO>> getFollowedUsersByUserName(@PathParam("user_name") String userName) {
		return us.getUserByName(userName)
			.flatMap(user -> fs.getFollowedDTO(user));
	}

	@GET
	@Path("/followers")
	public Uni<List<UserDTO>> getFollowers() {
		return us.getUserByToken(si)
			.flatMap(user -> fs.getFollowersDTO(user));
	}

	@GET
	@Path("/followers/{user_name}")
	public Uni<List<UserDTO>> getFollowersByUser(@PathParam("user_name") String userName) {
		return us.getUserByName(userName)
			.flatMap(user -> fs.getFollowersDTO(user));
	}

	@POST
	@Path("/follow/{user_name}")
	public Uni<Response> follow(@PathParam("user_name") String userName) {
		return fs.follow(si, userName);
	}

	@DELETE
	@Path("/unfollow/{user_name}")
	public Uni<Response> unfollow(@PathParam("user_name") String userName) {
		return fs.unfollow(si, userName);
	}

	@GET
	@Path("/follow/{user_name}")
	public Uni<Response> getFollow(@PathParam("user_name") String userName) {
		return fs.getFollow(si, userName);
	}

}
