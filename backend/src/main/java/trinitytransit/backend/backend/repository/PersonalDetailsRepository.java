package trinitytransit.backend.backend.repository;

import trinitytransit.backend.backend.entity.PersonalDetails;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonalDetailsRepository extends JpaRepository<PersonalDetails, Long> {
}
