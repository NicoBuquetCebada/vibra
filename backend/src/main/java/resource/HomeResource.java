package resource;


import java.util.List;

import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import model.Search;
import model.dto.HomeDTO;
import model.dto.MetricsDTO;
import service.HomeService;
import service.SearchService;

@Path("/home")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class HomeResource {

	@Inject SecurityIdentity securityIdentity;

	@Inject HomeService hs;

	@Inject SearchService ss;

	//Pagination size
	private final Integer pageSize = 1; // CON 3 SE DESBORDA EL STACK DE REFERENCIA DE HIBERNATE

	@GET
	public Uni<List<HomeDTO>> getHome(@QueryParam("page") Integer page) {
		return hs.getHome(securityIdentity, page, pageSize);
	}

	@GET
	@Path("/{post_id}")
	public Uni<MetricsDTO> getMetrics(@PathParam("post_id") Long post) {
		return hs.getMetrics(securityIdentity, post);
	}

	@GET
	@Path("/search/{search}")
	public Uni<List<Search>> search(@PathParam("search") String text) {
		return ss.search(text);
	}

}
