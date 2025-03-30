package trinitytransit.backend.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import trinitytransit.backend.backend.entity.Photo;
import trinitytransit.backend.backend.repository.PhotoRepository;

import java.io.IOException;
import java.util.Optional;

@RestController
@RequestMapping("/api/photos")
public class PhotoController {

    @Autowired
    private PhotoRepository photoRepository;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadPhoto(@RequestParam("photo") MultipartFile file) throws IOException {
        Photo photo = new Photo();
        photo.setFilename(file.getOriginalFilename());
        photo.setData(file.getBytes());
        Photo saved = photoRepository.save(photo); 
        return ResponseEntity.ok("Photo uploaded successfully with ID: " + saved.getId());
    }

    @GetMapping(value = "/{id}", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> getPhotoById(@PathVariable Long id) {
        return photoRepository.findById(id)
            .map(photo -> ResponseEntity
                .ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(photo.getData()))
            .orElse(ResponseEntity.notFound().build());
    }

    // 🗑️ Delete photo by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePhotoById(@PathVariable Long id) {
        if (photoRepository.existsById(id)) {
            photoRepository.deleteById(id);
            return ResponseEntity.noContent().build(); // 204
        } else {
            return ResponseEntity.notFound().build(); // 404
        }
    }

    @DeleteMapping("/by-name/{name}")
    public ResponseEntity<Void> deleteByName(@PathVariable String name) {
        Optional<Photo> optionalProvider = photoRepository.findByFilename(name);

        if (optionalProvider.isPresent()) {
            photoRepository.delete(optionalProvider.get());
            return ResponseEntity.noContent().build(); // 204
        } else {
            return ResponseEntity.notFound().build(); // 404
        }
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllPhotos() {
        photoRepository.deleteAll();
        return ResponseEntity.noContent().build(); // 204
    }
}
