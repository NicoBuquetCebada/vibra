package service;

import java.time.LocalDateTime;
import java.util.List;

import exception.CustomNotFoundException;
import io.smallrye.mutiny.Multi;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import model.Album;
import model.Song;
import model.User;
import model.dto.AlbumPostDTO;

@ApplicationScoped
public class AlbumService {

	@Inject SongService ss;

	//Information requests

	public Uni<List<Album>> getAllAlbums() {
		return Album.findAll().list();
	}

	public Uni<Album> getAlbumById(Long id) {
		return Album.<Album>findById(id)
			.onItem().ifNull()
			.failWith(new CustomNotFoundException("Album not found: " + id));
	}

	// page = OFFSET pageSize = LIMIT | page = 2 pageSize = 10 -> LIMIT 10 OFFSET (2 * 10)
	public  Uni<List<Album>> searchAlbumsByName(String text, Integer pageSize) {
		return Album.find("FROM Album WHERE LOWER(name) LIKE LOWER(?1)", "%" + text + "%")
			.page(0, pageSize).list();
	}

	//Count results
	public Uni<Long> countSearchResult(String text) {
		return Album.count("name LIKE ?1", "%" + text + "%");
	}

	//Modification requests

	//Insert
	public Uni<Album> persistAlbum(Album album) {
		return Album.persist(album).replaceWith(album);
	}

	public Uni<Album> createAlbumfromPost(User user, AlbumPostDTO postDTO) {
		Album a = new Album(postDTO.albumName, postDTO.coverImg, LocalDateTime.now(), user);

		return persistAlbum(a).flatMap(album -> {
			return Multi.createFrom().iterable(postDTO.songs)
				.onItem().transformToUniAndMerge(song -> {
					
					Song s = new Song(song.name, postDTO.coverImg, LocalDateTime.now(), song.audio , user, album);
					return ss.persistSong(s);
				}).collect().asList()
				.replaceWith(album);
		});
	}

}
