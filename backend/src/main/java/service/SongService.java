package service;

import java.util.List;

import exception.CustomNotFoundException;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.Response;
import model.Album;
import model.Song;

@ApplicationScoped
public class SongService {

	//Information requests
	public Uni<List<Song>> getAllSongs() {
		return Song.findAll().list();
	}

	public Uni<Song> getSongById(Long id) {
		return Song.<Song>findById(id)
			.onItem().ifNull()
			.failWith(new CustomNotFoundException("Song not found: " + id));
	}

	// page = OFFSET pageSize = LIMIT | page = 2 pageSize = 10 -> LIMIT 10 OFFSET (2 * 10)
	public Uni<List<Song>> searchSongsByName(String text, Integer pageSize) {
		return Song.find("FROM Song WHERE LOWER(name) LIKE LOWER(?1)", "%" + text + "%")
			.page(0, pageSize).list();
	}

	//Count results
	public Uni<Long> countSearchResult(String text) {
		return Song.count("name LIKE ?1", "%" + text + "%");
	}

	public Uni<List<Song>> getSongsByAlbum(Album album) {
		return Song.find("album", album).list();
	}



	//Modification requests

	//Insert
	public Uni<Response> persistSong(Song song) {
		return Song.persist(song)
				.onItem().transform(ignore -> Response.status(201).build());
	}

}
