package trinitytransit.backend.backend.service;

import trinitytransit.backend.backend.entity.Buses;
import trinitytransit.backend.backend.repository.BusesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
    
    
    public List<Buses> saveBuses(List<Buses> buses) {
        return repo.saveAll(buses);
    }
    
    public void deleteBusById(Long id) {
        repo.deleteById(id);
    }
    
    public boolean deleteBusByName(String name) {
        Optional<Buses> optionalBus = repo.findByName(name);
        if (optionalBus.isPresent()) {
            repo.delete(optionalBus.get());
            return true;
        }
        return false;
    }
    
    public void deleteAllBuses() {
        repo.deleteAll();
    }
}
