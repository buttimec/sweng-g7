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
    public PersonalDetails createUser(@RequestBody PersonalDetails user) {
        return repo.save(user);
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

}
