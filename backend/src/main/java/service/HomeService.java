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
import model.dto.MetricsDTO;
import model.dto.SongDTO;
import model.dto.UserDTO;

@ApplicationScoped
public class HomeService {

	@Inject UserService us;

	@Inject FollowService fs;

	@Inject PostService ps;

	@Inject RepostService rs;

	@Inject SongService ss;

	@Inject SaveService sas;

	@Inject RateService ras;
	
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
										if (repost.post.albumId != null) {
											return ss.getSongsByAlbum(repost.post.albumId.id)
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

	@WithSession
	public Uni<MetricsDTO> getMetrics(SecurityIdentity si, Long post) {
		return us.getUserByToken(si)
			.flatMap(user -> {
				return rs.getRespostByPost(post, user)
					.flatMap(repost -> {
						return ras.getRatesByPost(post, user)
						.flatMap(rate -> {
							return sas.getSaveByPost(post, user)
								.onItem().transform(save -> {
									Integer rat = 0;
									boolean sav = false;
									boolean rep = false;

									if (rate != null)
										rat = rate.rate;
									if (save != null)
										sav = true;
									if (repost != null)
										rep = true;

									return new MetricsDTO(post, rat, sav, rep);
								});
						});
				});
			});
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
			coverImg,
			post.id
		));
	}
	
	public Uni<HomeDTO> homeOfRepost(Repost repost, List<Song> songs) {
		String content = null;
		String coverImg = null;
		SongDTO song = null;
		AlbumDTO album = null;
		
		if (repost.post.songId != null|| repost.post.albumId != null) {
			content = (repost.post.albumId == null) ? "song" : "album";
			coverImg = (repost.post.albumId == null) ? repost.post.songId.coverImg : repost.post.albumId.coverImg;
		}
	
		if (repost.post.songId != null) {
			song = new SongDTO(repost.post.songId.name, repost.post.songId.audio);
		} else if (songs != null) {
			List<SongDTO> songDTOs = songs.stream()
				.map(s -> new SongDTO(s.name, s.audio))
				.toList();
			album = new AlbumDTO(repost.post.albumId.name, songDTOs);
		}
	
		return Uni.createFrom().<HomeDTO>item(new HomeDTO(
			"repost",
			repost.createdAt,
			new UserDTO(repost.post.userName),
			new UserDTO(repost.user),
			content,
			song,
			album,
			coverImg,
			repost.post.id
		));
	}
	

}
