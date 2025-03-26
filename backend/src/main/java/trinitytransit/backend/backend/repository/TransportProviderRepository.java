package trinitytransit.backend.backend.repository;

import trinitytransit.backend.backend.entity.TransportProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransportProviderRepository extends JpaRepository<TransportProvider, Long> {
}