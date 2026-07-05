package com.fleetflow.repository;

import com.fleetflow.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByStatus(Vehicle.VehicleStatus status);
    List<Vehicle> findByType(Vehicle.VehicleType type);
}
