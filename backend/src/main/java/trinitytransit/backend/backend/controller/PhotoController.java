package trinitytransit.backend.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import trinitytransit.backend.backend.entity.Photo;
import trinitytransit.backend.backend.repository.PhotoRepository;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllPhotos() {
        List<Map<String, Object>> photos = photoRepository.findAll().stream()
            .map(photo -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", photo.getId());
                map.put("filename", photo.getFilename());
                map.put("description", photo.getDescription()); 
                map.put("uploadTime", photo.getUploadTime());
                map.put("assignedBus", photo.getAssignedBus());
                map.put("assignedBusStop", photo.getAssignedBusStop());
                return map;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(photos);
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

    @PutMapping("/{id}/description")
    public ResponseEntity<Void> updateDescription(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Photo> optionalPhoto = photoRepository.findById(id);
        if (optionalPhoto.isPresent()) {
            Photo photo = optionalPhoto.get();
            photo.setDescription(body.get("description"));
            photoRepository.save(photo);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/assignment")
    public ResponseEntity<Void> updateAssignment(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Photo> optionalPhoto = photoRepository.findById(id);
        if(optionalPhoto.isPresent()){
           Photo photo = optionalPhoto.get();
           if(body.containsKey("bus")){
             photo.setAssignedBus(body.get("bus"));
           }
           if(body.containsKey("busStop")){
             photo.setAssignedBusStop(body.get("busStop"));
           }
           photoRepository.save(photo);
           return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    
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
