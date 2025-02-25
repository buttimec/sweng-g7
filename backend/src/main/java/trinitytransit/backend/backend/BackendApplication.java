package trinitytransit.backend.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
        // No need for any Google Maps API calls here, everything is handled by the controller
        System.out.println("Backend application is running...");
    }
}
