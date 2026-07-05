package com.fleetflow.repository;

import com.fleetflow.model.DeliveryOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryOrderRepository extends JpaRepository<DeliveryOrder, Long> {
    List<DeliveryOrder> findByStatus(DeliveryOrder.OrderStatus status);
    List<DeliveryOrder> findByPriority(DeliveryOrder.OrderPriority priority);
    List<DeliveryOrder> findByAssignedVehicleId(Long vehicleId);
    Optional<DeliveryOrder> findByOrderId(String orderId);
}
