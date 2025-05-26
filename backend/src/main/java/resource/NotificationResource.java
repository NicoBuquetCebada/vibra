package resource;

import java.util.List;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import model.Notification;
import service.NotificationService;

@Path("/notifications")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class NotificationResource {

	@Inject SecurityIdentity si;

	@Inject NotificationService ns;

	@GET
	@Authenticated
	public Uni<List<Notification>> getNotifications() {
		return ns.getUserNotifications(si);
	}
}
