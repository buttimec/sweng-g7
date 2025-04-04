package trinitytransit.backend.backend.repository;

import trinitytransit.backend.backend.entity.Buses;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BusesRepository extends JpaRepository<Buses, Long> {
    Optional<Buses> findByName(String name);       // for fetching
    void deleteByName(String name);                // direct deletion (only if name is unique)

}
