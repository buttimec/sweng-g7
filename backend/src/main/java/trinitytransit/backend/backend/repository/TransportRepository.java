package trinitytransit.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import trinitytransit.backend.backend.entity.Buses;

public interface TransportRepository extends JpaRepository<Buses, Integer> {
}
