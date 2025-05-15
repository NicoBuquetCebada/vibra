package service;

import java.util.List;

import exception.CustomNotFoundException;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.core.Response;
import model.Song;

public class SongService {

	//Information requests
	public static Uni<List<Song>> getAllSongs() {
		return Song.findAll().list();
	}

	public static Uni<Song> getSongById(Long id) {
		return Song.<Song>findById(id)
			.onItem().ifNull()
			.failWith(new CustomNotFoundException("Song not found: " + id));
	}

	public static Uni<List<Song>> searchSongsByName(String text, Integer pageSize) {
		return Song.searchByName(text, 0, pageSize);
	}


	//Modification requests

	//Insert
	public static Uni<Response> insertSong(Song song) {
		return Panache.withTransaction(() -> persistSong(song));
	}

	public static Uni<Response> persistSong(Song song) {
		return Song.persist(song)
				.onItem().transform(ignore -> Response.status(201).build());
	}

}
