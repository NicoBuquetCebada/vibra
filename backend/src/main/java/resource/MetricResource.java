package resource;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
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
	
	@Authenticated
	@DELETE
	@Path("/rate/{post_id}")
	public Uni<Response> deleteRate(@PathParam("post_id") Long post) {
		return rs.deleteRate(securityIdentity, post);
	}

	@Authenticated
	@PUT
	@Path("/rate")
	public Uni<Response> updateRate(RateDTO rate) {
		return rs.updateRate(securityIdentity, rate);
	}

	@POST
	@Path("/save")
	@Authenticated
	public Uni<Response> savePost(Long postId) {
		return ss.savePost(securityIdentity, postId);
	}
	
	@DELETE
	@Path("/save/{post_id}")
	@Authenticated
	public Uni<Response> deleteSave(@PathParam("post_id") Long postId) {
		return ss.deleteSave(securityIdentity, postId);
	}

	@POST
	@Path("/repost")
	@Authenticated
	public Uni<Response> repostPost(Long postId) {
		return res.repostPost(securityIdentity, postId);
	}

	@Authenticated
	@DELETE
	@Path("/repost/{post_id}")
	public Uni<Response> deleteRepost(@PathParam("post_id") Long post) {
		return res.deleteRepost(securityIdentity, post);
	}
}
