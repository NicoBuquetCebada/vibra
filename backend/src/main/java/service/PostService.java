package service;

import java.time.LocalDateTime;
import java.util.List;

import exception.CustomNotFoundException;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import model.Album;
import model.Post;
import model.Song;
import model.User;
import model.dto.PostDTO;

@ApplicationScoped
public class PostService {

	@Inject UserService us;

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

	/* public Uni<Response> addPost(PostDTO postDTO, SecurityIdentity securityIdentity) {
		return us.getUserByToken(securityIdentity)
			.flatMap(user -> {
				String content = postDTO.content.toLowerCase();

				if ("song".equals(content)) {
					Song song = new Song(
						postDTO.song.name,
						postDTO.coverImg,
						LocalDateTime.now(),
						postDTO.song.audio,
						user,
						null
					);

					return song.persist()
						.flatMap(() -> {
							Post newPost = new Post(
								LocalDateTime.now(),
								user,
								null,
								song
							);
							return newPost.persist()
								.replaceWith(Response.ok().build());
						});
				}

				if ("album".equals(content)) {
					Album album = new Album(
						postDTO.album.name,
						postDTO.coverImg,
						LocalDateTime.now(),
						user
					);

					return album.persist()
						.flatMap(() ->
							Multi.createFrom().iterable(postDTO.album.songs)
								.onItem().<Song>transform(songDTO ->
									new Song(
										songDTO.name,
										postDTO.coverImg,
										LocalDateTime.now(),
										songDTO.audio,
										user,
										album
									)
								)
								.onItem().transformToUniAndMerge(song -> song.persist())
								.collect().asList()
								.flatMap(songs -> {
									Post newPost = new Post(
										LocalDateTime.now(),
										user,
										album,
										null
									);
									return newPost.<Post.map(v -> Response.ok().build())>persist()
										.replaceWith(Response.ok().build());
								})
						);
				}

				return Uni.createFrom().item(Response.status(Response.Status.BAD_REQUEST)
					.entity("Invalid content type").build());
			});
	} */



}
