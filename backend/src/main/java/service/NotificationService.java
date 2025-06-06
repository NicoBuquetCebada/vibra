package service;

import java.util.List;

import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import model.Notification;

@ApplicationScoped
public class NotificationService {

	@Inject UserService us;
	
	public Uni<List<Notification>> getUserNotifications(SecurityIdentity si) {
		return us.getUserByToken(si)
			.flatMap(user -> Notification.find("contentUserName = ?1 ORDER BY createdAt DESC", user.name).list());
	}

}
