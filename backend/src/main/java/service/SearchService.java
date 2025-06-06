package service;

import java.util.List;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import model.Search;

@ApplicationScoped
public class SearchService {

	public Uni<List<Search>> search(String search) {
		return Search.find("LOWER(name) LIKE ?1 ORDER BY name ASC", "%" + search.toLowerCase() + "%")
			.page(0, 5).list();
	}

}
