package service;

import java.util.ArrayList;
import java.util.List;

import io.quarkus.hibernate.reactive.panache.common.WithSession;
import io.quarkus.security.identity.SecurityIdentity;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import model.Post;
import model.Repost;
import model.Song;
import model.User;
import model.dto.AlbumDTO;
import model.dto.HomeDTO;
import model.dto.SongDTO;
import model.dto.UserDTO;

@ApplicationScoped
public class HomeService {

	@Inject UserService us;

	@Inject FollowService fs;

	@Inject PostService ps;

	@Inject RepostService rs;

	@Inject SongService ss;
	
	@WithSession
	public Uni<List<HomeDTO>> getHome(SecurityIdentity si, Integer page, Integer pageSize) {
		int safePage = (page == null) ? 0 : page;
		return us.getUserByToken(si)
			.flatMap(user -> fs.getFollowed(user)
				.flatMap(followed -> getHomeObjects(followed, safePage, pageSize))
			);
	}
	
	public Uni<List<HomeDTO>> getHomeObjects(List<User> followed, Integer page, Integer pageSize) {
		if (followed.isEmpty()) {
			return Uni.createFrom().item(List.of());
		}
		return ps.getLatestPostsOf(followed, page, pageSize)
		    .onFailure().invoke(e -> System.err.println("Error en getLatestPostsOf: " + e))
			.flatMap(posts -> 
				
				Multi.createFrom().iterable(posts)
					.onItem().<HomeDTO>transformToUniAndMerge(post -> {
						if (post.albumId != null) {
							return ss.getSongsByAlbum(post.albumId.id)
								.flatMap(songs -> homeOfPost(post, songs));
						} else {
							return homeOfPost(post, null);
						}
					})
					.collect().asList()
					.flatMap(homePostDTOs ->
						rs.getLatestRepostsOf(followed, page, pageSize)
							.flatMap(reposts ->
								Multi.createFrom().iterable(reposts)
									.onItem().<HomeDTO>transformToUniAndMerge(repost -> {
										if (repost.postId.albumId != null) {
											return ss.getSongsByAlbum(repost.postId.albumId.id)
												.flatMap(songs -> homeOfRepost(repost, songs));
										} else {
											return homeOfRepost(repost, null);
										}
									})
									.collect().asList()
									.map(homeRepostDTOs -> {
										List<HomeDTO> items = new ArrayList<>();
										items.addAll(homePostDTOs);
										items.addAll(homeRepostDTOs);
										return items.stream()
											.sorted((a, b) -> b.createdAt.compareTo(a.createdAt))
											.toList();
									})
							)
					)
			);
	}
	
	//HomeDTO of constructors
	public Uni<HomeDTO> homeOfPost(Post post, List<Song> songs) {
		String content = null;
		String coverImg = null;
		SongDTO song = null;
		AlbumDTO album = null;
		
		if (post.songId != null|| post.albumId != null) {
			content = (post.albumId == null) ? "song" : "album";
			coverImg = (post.albumId == null) ? post.songId.coverImg : post.albumId.coverImg;
		}

		if (post.songId != null) {
			song = new SongDTO(post.songId.name, post.songId.audio);
		} else if (songs != null) {
			List<SongDTO> songDTOs = songs.stream()
				.map(s -> new SongDTO(s.name, s.audio))
				.toList();
			album = new AlbumDTO(post.albumId.name, songDTOs);
		}

		return Uni.createFrom().item(new HomeDTO(
			"post",
			post.createdAt,
			new UserDTO(post.userName),
			null,
			content,
			song,
			album,
			coverImg
		));
	}
	
	public Uni<HomeDTO> homeOfRepost(Repost repost, List<Song> songs) {
		String content = null;
		String coverImg = null;
		SongDTO song = null;
		AlbumDTO album = null;
		
		if (repost.postId.songId != null|| repost.postId.albumId != null) {
			content = (repost.postId.albumId == null) ? "song" : "album";
			coverImg = (repost.postId.albumId == null) ? repost.postId.songId.coverImg : repost.postId.albumId.coverImg;
		}
	
		if (repost.postId.songId != null) {
			song = new SongDTO(repost.postId.songId.name, repost.postId.songId.audio);
		} else if (songs != null) {
			List<SongDTO> songDTOs = songs.stream()
				.map(s -> new SongDTO(s.name, s.audio))
				.toList();
			album = new AlbumDTO(repost.postId.albumId.name, songDTOs);
		}
	
		return Uni.createFrom().<HomeDTO>item(new HomeDTO(
			"repost",
			repost.createdAt,
			new UserDTO(repost.postId.userName),
			new UserDTO(repost.userName),
			content,
			song,
			album,
			coverImg
		));
	}
	

}
