package trinitytransit.backend.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trinitytransit.backend.backend.entity.FavouriteProvider;
import trinitytransit.backend.backend.repository.FavouriteProviderRepository;
import trinitytransit.backend.backend.repository.PersonalDetailsRepository;
import trinitytransit.backend.backend.repository.TransportProviderRepository;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/favourites")
public class FavouriteProviderController {

    @Autowired
    private FavouriteProviderRepository favouriteRepository;

    @Autowired
    private TransportProviderRepository transportProviderRepository;

    @Autowired
    private PersonalDetailsRepository personalDetailsRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<List<FavouriteProvider>> getUserFavourites(@PathVariable Long userId) {
        List<FavouriteProvider> favourites = favouriteRepository.findByUserId(userId);
        return ResponseEntity.ok(favourites);
    }

    @PostMapping("/add")
    public ResponseEntity<FavouriteProvider> addFavourite(
            @RequestParam Long userId,
            @RequestParam Long providerId
    ) {
        if (favouriteRepository.existsByUserIdAndProviderId(userId, providerId)) {
            return ResponseEntity.status(409).build(); // Conflict - already exists
        }

        return transportProviderRepository.findById(providerId)
                .flatMap(provider -> personalDetailsRepository.findById(userId)
                        .map(user -> {
                            FavouriteProvider favourite = new FavouriteProvider(provider, user);
                            return ResponseEntity.ok(favouriteRepository.save(favourite));
                        }))
                .orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFavourite(@PathVariable Long id) {
        if (favouriteRepository.existsById(id)) {
            favouriteRepository.deleteById(id);
            return ResponseEntity.noContent().build(); // 204
        } else {
            return ResponseEntity.notFound().build(); // 404
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteFavourite(
        @RequestParam Long userId,
        @RequestParam Long providerId
        ) {
        if (favouriteRepository.existsByUserIdAndProviderId(userId, providerId)) {
            favouriteRepository.deleteById(userId);
            return ResponseEntity.noContent().build(); // 204
        } else {
            return ResponseEntity.notFound().build(); // 404
        }
    }

    @GetMapping("/exists")
    public ResponseEntity<Boolean> checkFavouriteExists(
            @RequestParam Long userId,
            @RequestParam Long providerId
    ) {
        boolean exists = favouriteRepository.existsByUserIdAndProviderId(userId, providerId);
        return ResponseEntity.ok(exists);
    }
}