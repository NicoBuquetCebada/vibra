package service;

import java.time.LocalDateTime;
import java.util.List;

import exception.CustomNotFoundException;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import model.Post;
import model.Song;
import model.User;
import model.dto.AlbumPostDTO;
import model.dto.SongPostDTO;

@ApplicationScoped
public class PostService {

	@Inject UserService us;

	@Inject SongService ss;

	@Inject AlbumService as;

	public Uni<List<Post>> getAllposts() {
		return Post.findAll().list();
	}

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

	@WithTransaction
	public Uni<Response> addSongPost(SecurityIdentity si, SongPostDTO postDTO) {
		return us.getUserByToken(si)
			.flatMap(user -> {
				Song song = new Song(
					postDTO.songName,
					postDTO.coverImg,
					LocalDateTime.now(),
					postDTO.audio,
					user,
					null
				);

				return ss.persistSong(song)
					.flatMap(ignore -> {
						Post post = new Post(
							LocalDateTime.now(),
							user,
							null,
							song
						);

						return persistPost(post);
					});
			});
	}

	@WithTransaction
	public Uni<Response> addAlbumPost(SecurityIdentity si, AlbumPostDTO postDTO) {
		return us.getUserByToken(si)
			.flatMap(user -> {
				return as.createAlbumfromPost(user, postDTO)
					.flatMap(album -> {
						Post post = new Post(
							LocalDateTime.now(),
							user,
							album,
							null
						);

						return persistPost(post);
					});
			});
	}

	public Uni<Response> persistPost(Post post) {
		return Post.persist(post)
			.onItem().transform(ignore -> Response.status(201).build());
	}

}
