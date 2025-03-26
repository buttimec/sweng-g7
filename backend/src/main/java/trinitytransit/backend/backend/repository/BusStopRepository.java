package trinitytransit.backend.backend.repository;

import trinitytransit.backend.backend.entity.BusStop;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusStopRepository extends JpaRepository<BusStop, Long> {
}
