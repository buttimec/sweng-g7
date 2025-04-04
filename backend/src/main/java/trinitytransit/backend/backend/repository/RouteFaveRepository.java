package trinitytransit.backend.backend.repository;

import trinitytransit.backend.backend.entity.RouteFave;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RouteFaveRepository extends JpaRepository<RouteFave, Long> {
    Optional<RouteFave> findByName(String name);
    void deleteByName(String name); // optional, only if name is unique
    List<RouteFave> findAllByName(String name);
}
