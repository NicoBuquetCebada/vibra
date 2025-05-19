package resource;

import java.util.List;

import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import model.Post;
import model.dto.AlbumPostDTO;
import model.dto.SongPostDTO;
import service.PostService;

@Path("/posts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PostResource {

	@Inject PostService ps;

	@Inject SecurityIdentity securityIdentity;

	@POST
	@Path("/song")
	public Uni<Response> addSongPost(SongPostDTO postDTO) {
		return ps.addSongPost(securityIdentity, postDTO);
	}

	@POST
	@Path("/album")
	public Uni<Response> addAlbumPost(AlbumPostDTO postDTO) {
		return ps.addAlbumPost(securityIdentity, postDTO);
	}

	@GET
	public Uni<List<Post>> getAllPosts() {
		return ps.getAllposts();
	}
}
