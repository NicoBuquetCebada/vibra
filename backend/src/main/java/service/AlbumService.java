package service;

import java.util.List;

import exception.CustomNotFoundException;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.ws.rs.core.Response;
import model.Album;

public class AlbumService {

	//Information requests
	public static Uni<List<Album>> getAllAlbums() {
		return Album.findAll().list();
	}

	public static Uni<Album> getAlbumById(Long id) {
		return Album.<Album>findById(id)
			.onItem().ifNull()
			.failWith(new CustomNotFoundException("Album not found: " + id));
	}

	public static Uni<List<Album>> searchAlbumsByName(String text, Integer pageSize) {
		return Album.searchByName(text, 0, pageSize);
	}


	//Modification requests

	//Insert
	public static Uni<Response> insertAlbum(Album album) {
		return Panache.withTransaction(() -> persistAlbum(album));
	}

	public static Uni<Response> persistAlbum(Album album) {
		return Album.persist(album)
				.onItem().transform(ignore -> Response.status(201).build());
	}

}
