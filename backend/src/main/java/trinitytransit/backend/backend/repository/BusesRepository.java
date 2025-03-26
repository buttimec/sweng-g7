package trinitytransit.backend.backend.repository;

import trinitytransit.backend.backend.entity.Buses;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusesRepository extends JpaRepository<Buses, Long> {
}
