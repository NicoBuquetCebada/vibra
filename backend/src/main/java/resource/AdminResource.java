package resource;

import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/api/admin")
@Produces(MediaType.TEXT_PLAIN)
public class AdminResource {

	@Inject
	SecurityIdentity securityIdentity;

	@GET
	public String admin() {
		return String.format("Granted user: %s", securityIdentity.getPrincipal().getName());
	}

}
