package trinitytransit.backend.backend.controller;

import trinitytransit.backend.backend.service.BusesService;
import trinitytransit.backend.backend.entity.Buses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class BusesController {

    @Autowired
    private BusesService busservice;

    @GetMapping("/buses")
    public List<Buses> getAllBuses(){
        return busservice.getBus();
    }
}
