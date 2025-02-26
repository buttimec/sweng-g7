package trinitytransit.backend.backend.service;

import trinitytransit.backend.backend.repository.BusesRepository;
import trinitytransit.backend.backend.entity.Buses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class BusesService {

    @Autowired
    private BusesRepository busRepo;

    public List<Buses> getBus (){
        return new ArrayList<>(busRepo.findAll());
    }

}
