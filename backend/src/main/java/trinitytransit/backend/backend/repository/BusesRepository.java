package trinitytransit.backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import trinitytransit.backend.backend.entity.Buses;

public interface BusesRepository extends JpaRepository<Buses, Integer> {
}
