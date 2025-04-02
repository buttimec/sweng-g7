package trinitytransit.backend.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "favourite_providers")
public class FavouriteProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "provider_id", nullable = false)
    private TransportProvider provider;  // Linked to TransportProvider

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private PersonalDetails user;       // Now linked via user_id (Long)

    public FavouriteProvider(TransportProvider provider, PersonalDetails user) {
        this.provider = provider;
        this.user = user;
    }

    public FavouriteProvider() {}
}