package resource;


import java.util.List;

import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import model.dto.HomeDTO;
import service.HomeService;

@Path("/home")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class HomeResource {

	@Inject
	SecurityIdentity securityIdentity;

	@Inject
	HomeService hs;

	//Pagination size
	private final Integer pageSize = 1;

	@GET
	public Uni<List<HomeDTO>> getHome(@QueryParam("page") Integer page) {
		return hs.getHome(securityIdentity, page, pageSize);
	}
}
