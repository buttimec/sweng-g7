package trinitytransit.backend.backend;

import trinitytransit.backend.backend.entity.TransportProvider;
import trinitytransit.backend.backend.repository.TransportProviderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.Map;

//adds the transport providers to the database on backend start up

@Component
public class TransportProviderSeeder {

    @Autowired
    private TransportProviderRepository repo;

    private static final Map<String, String> PROVIDERS = Map.of(
        "Dublin Bus", "Bus",
        "Bus Éireann", "Bus",
        "Luas", "Tram",
        "Irish Rail", "Train"
    );

    @PostConstruct
    public void seedProviders() {
        for (Map.Entry<String, String> entry : PROVIDERS.entrySet()) {
            String name = entry.getKey();
            String type = entry.getValue();

            boolean exists = repo.findAll().stream()
                .anyMatch(p -> p.getName().equalsIgnoreCase(name));

            if (!exists) {
                TransportProvider provider = new TransportProvider(name, type);
                repo.save(provider);
                System.out.println("Seeded: " + name);
            }
        }
    }
}
