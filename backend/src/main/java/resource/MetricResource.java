package resource;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import model.dto.RateDTO;
import service.RateService;
import service.RepostService;
import service.SaveService;

@Path("/metrics")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MetricResource {

	@Inject SecurityIdentity securityIdentity;

	@Inject RateService rs;

	@Inject SaveService ss;

	@Inject RepostService res;


	@POST
	@Path("/rate")
	@Authenticated
	public Uni<Response> ratePost(RateDTO rate) {
		return rs.ratePost(securityIdentity, rate);
	}

	@POST
	@Path("/save")
	@Authenticated
	public Uni<Response> savePost(Long postId) {
		return ss.savePost(securityIdentity, postId);
	}

	@POST
	@Path("/repost")
	@Authenticated
	public Uni<Response> repostPost(Long postId) {
		return res.repostPost(securityIdentity, postId);
	}
	
}
