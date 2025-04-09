package trinitytransit.backend.backend.repository;

import trinitytransit.backend.backend.entity.FavouriteProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FavouriteProviderRepository extends JpaRepository<FavouriteProvider, Long> {
    List<FavouriteProvider> findByUserId(Long userId);
    boolean existsByUserIdAndProviderId(Long userId, Long providerId);
    void deleteByUserIdAndProviderId (Long userId, Long providerId);
}