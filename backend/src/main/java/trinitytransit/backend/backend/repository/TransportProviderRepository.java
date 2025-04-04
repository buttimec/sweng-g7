package trinitytransit.backend.backend.repository;

import trinitytransit.backend.backend.entity.TransportProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TransportProviderRepository extends JpaRepository<TransportProvider, Long> {
    Optional<TransportProvider> findByName(String name);
}