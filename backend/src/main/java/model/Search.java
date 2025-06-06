package model;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "search_view")
public class Search extends PanacheEntityBase {

	@Id
	public String name;

	public Long id;
	public String type;
	public String img;

}
