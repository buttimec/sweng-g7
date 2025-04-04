package trinitytransit.backend.backend.repository;

import trinitytransit.backend.backend.entity.PersonalDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PersonalDetailsRepository extends JpaRepository<PersonalDetails, Long> {
    Optional<PersonalDetails> findByEmail(String email);
}