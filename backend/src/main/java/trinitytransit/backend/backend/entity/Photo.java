
package trinitytransit.backend.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Photo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String filename;

    @Lob
    private byte[] data;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private LocalDateTime uploadTime = LocalDateTime.now();

}


