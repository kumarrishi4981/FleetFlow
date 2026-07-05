package com.fleetflow.service;

import com.fleetflow.model.Vehicle;
import com.fleetflow.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<Vehicle> findAll() {
        return vehicleRepository.findAll();
    }

    public Optional<Vehicle> findById(Long id) {
        return vehicleRepository.findById(id);
    }

    public Vehicle save(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public Vehicle update(Long id, Vehicle vehicleData) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
        vehicle.setPlateNumber(vehicleData.getPlateNumber());
        vehicle.setType(vehicleData.getType());
        vehicle.setStatus(vehicleData.getStatus());
        vehicle.setCurrentLat(vehicleData.getCurrentLat());
        vehicle.setCurrentLng(vehicleData.getCurrentLng());
        vehicle.setFuelLevel(vehicleData.getFuelLevel());
        vehicle.setCapacity(vehicleData.getCapacity());
        vehicle.setDriverName(vehicleData.getDriverName());
        vehicle.setSpeed(vehicleData.getSpeed());
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateLocation(Long id, Double lat, Double lng) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
        vehicle.setCurrentLat(lat);
        vehicle.setCurrentLng(lng);
        return vehicleRepository.save(vehicle);
    }

    public Vehicle updateStatus(Long id, Vehicle.VehicleStatus status) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
        vehicle.setStatus(status);
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> findByStatus(Vehicle.VehicleStatus status) {
        return vehicleRepository.findByStatus(status);
    }

    public List<Vehicle> findByType(Vehicle.VehicleType type) {
        return vehicleRepository.findByType(type);
    }

    public void deleteById(Long id) {
        vehicleRepository.deleteById(id);
    }
}
