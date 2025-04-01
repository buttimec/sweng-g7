package trinitytransit.backend.backend.entity;

import jakarta.persistence.*;

@Entity
public class RouteFave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String startLocation;

    public RouteFave() {
    }

    public RouteFave(String name, String startLocation) {
        this.name = name;
        this.startLocation = startLocation;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getStartLocation() {
        return startLocation;
    }

    public void setStartLocation(String startLocation) {
        this.startLocation = startLocation;
    }
}
