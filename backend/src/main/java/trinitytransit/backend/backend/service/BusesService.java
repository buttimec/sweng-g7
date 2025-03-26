package trinitytransit.backend.backend.service;

import trinitytransit.backend.backend.entity.Buses;
import trinitytransit.backend.backend.repository.BusesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BusesService {

    @Autowired
    private BusesRepository repo;

    public List<Buses> getBus() {
        return repo.findAll();
    }

    public Buses saveBus(Buses bus) {
        return repo.save(bus);
    }
}
