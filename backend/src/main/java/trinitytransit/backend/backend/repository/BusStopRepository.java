package trinitytransit.backend.backend.repository;

import trinitytransit.backend.backend.entity.BusStop;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BusStopRepository extends JpaRepository<BusStop, Long> {
    Optional<BusStop> findByName(String name);
    void deleteByName(String name); // optional, only if name is unique
}
