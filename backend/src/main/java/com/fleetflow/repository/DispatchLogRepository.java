package com.fleetflow.repository;

import com.fleetflow.model.DispatchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DispatchLogRepository extends JpaRepository<DispatchLog, Long> {
    List<DispatchLog> findByVehicleIdOrderByTimestampDesc(Long vehicleId);
    List<DispatchLog> findTop20ByOrderByTimestampDesc();
}
