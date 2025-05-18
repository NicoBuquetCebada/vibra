package service;

import java.util.List;

import exception.CustomNotFoundException;
import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.Response;
import model.Album;

@ApplicationScoped
public class AlbumService {

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
	public Uni<Response> insertAlbum(Album album) {
		return Panache.withTransaction(() -> persistAlbum(album));
	}

	public Uni<Response> persistAlbum(Album album) {
		return Album.persist(album)
				.onItem().transform(ignore -> Response.status(201).build());
	}

}
