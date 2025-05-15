package resource;

import java.util.List;

import io.quarkus.security.Authenticated;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import model.Album;
import service.AlbumService;

@Path("/albums")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AlbumResource {

	@Authenticated
	@GET
	public Uni<List<Album>> getAllAlbums() {
		return AlbumService.getAllAlbums();
	}

	@GET
	@Path("/{id}")
	public Uni<Album> getAlbumById(@PathParam("id") Long id) {
		return AlbumService.getAlbumById(id);
	}

	// GET /albums/search?searched=buqueda&limit=10
	@GET
	@Path("/search")
	public Uni<List<Album>> searchAlbumsByName(
		@QueryParam("searched") String searchText,
		@QueryParam("limit") Integer limit
	) {
		return AlbumService.searchAlbumsByName(searchText, limit);
	}

	@POST
	public Uni<Response> addAlbum(Album album) {
		return AlbumService.insertAlbum(album);
	}
}
