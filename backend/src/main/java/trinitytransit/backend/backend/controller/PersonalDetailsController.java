package trinitytransit.backend.backend.controller;

import trinitytransit.backend.backend.entity.PersonalDetails;
import trinitytransit.backend.backend.repository.PersonalDetailsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
public class PersonalDetailsController {

    @Autowired
    private PersonalDetailsRepository repo;

    @GetMapping
    public List<PersonalDetails> getAllUsers() {
        return repo.findAll();
    }

    @PostMapping
    public ResponseEntity<PersonalDetails> createUser(@RequestBody PersonalDetails user) {
        if (user.getId() != null && repo.existsById(user.getId())) {
            // User with this ID already exists — conflict
            return ResponseEntity.status(409).build();
        }

        // Optionally force ID = 1 if you're working with a single static user
        // if (user.getId() == null) user.setId(1L);

        PersonalDetails saved = repo.save(user);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PersonalDetails> updateUser(@PathVariable Long id, @RequestBody PersonalDetails updatedUser) {
        return repo.findById(id)
            .map(user -> {
                user.setName(updatedUser.getName());
                user.setEmail(updatedUser.getEmail());
                user.setHome(updatedUser.getHome());
                user.setWork(updatedUser.getWork());
                return ResponseEntity.ok(repo.save(user));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonalDetails> getUserById(@PathVariable Long id) {
        return repo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

}
