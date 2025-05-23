package service;

import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import model.UserPage;

@ApplicationScoped
public class UserPageService {

	@Inject UserService us;

	public Uni<UserPage> getPage(SecurityIdentity si) {
		return us.getUserByToken(si)
			.flatMap(user -> {
				return UserPage.find("LOWER(name) LIKE ?1", user.name).firstResult();
			});
	}

}
