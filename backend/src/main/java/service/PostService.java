package service;

import java.util.List;

import exception.CustomNotFoundException;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import model.Post;
import model.User;

@ApplicationScoped
public class PostService {

	public Uni<Post> getPostById(Long id) {
		return Post.<Post>findById(id)
			.onItem().ifNull()
			.failWith(new CustomNotFoundException("Post not found: " + id));
	}
	
	public Uni<List<Post>> getLatestPostsOf(List<User> followed, Integer page, Integer pageSize) {
		return Post.find("userName IN ?1 ORDER BY createdAt DESC", followed)
			.page(page, pageSize)
			.list();
	}

}
