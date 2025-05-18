package resource;

import java.util.List;

import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import model.Song;
import service.SongService;

@Path("/songs")
@Produces(MediaType.APPLICATION_JSON_PATCH_JSON)
@Consumes(MediaType.APPLICATION_JSON_PATCH_JSON)
public class SongResource {

	@Inject SongService ss;

	@GET
	public Uni<List<Song>> getAllSongs() {
		return ss.getAllSongs();
	}

	@GET
	@Path("/{id}")
	public Uni<Song> getSongById(@PathParam("id") Long id) {
		return ss.getSongById(id);
	}

	// GET /albums/search?searched=buqueda&limit=10
	@GET
	@Path("/search")
	public Uni<List<Song>> searchSongsByName(
		@QueryParam("searched") String searchText,
		@QueryParam("limit") Integer limit
	) {
		return ss.searchSongsByName(searchText, limit);
	}

	@POST
	public Uni<Response> addSong(Song album) {
		return ss.insertSong(album);
	}
}
