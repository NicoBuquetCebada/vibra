package service;

import java.util.List;

import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import model.UserPage;
import model.UserPagePost;

@ApplicationScoped
public class UserPageService {

	@Inject UserService us;
	@Inject PostService ps;

	public Uni<UserPage> getPage(SecurityIdentity si) {
		return us.getUserByToken(si)
			.flatMap(user -> {
				return UserPage.find("LOWER(name) LIKE ?1", user.name).firstResult();
			});
	}

	public Uni<List<UserPagePost>> getPostsByUserName(SecurityIdentity si) {
        return us.getUserByToken(si)
			.flatMap(user -> UserPagePost.find("userName = ?1 ORDER BY createdAt DESC", user.name).list());		
    }

}
