package trinitytransit.backend.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import trinitytransit.backend.backend.entity.Photo;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
    Optional<Photo> findByFilename(String filename);
}