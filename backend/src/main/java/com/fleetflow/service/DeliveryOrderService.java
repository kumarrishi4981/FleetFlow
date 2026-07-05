package com.fleetflow.service;

import com.fleetflow.model.DeliveryOrder;
import com.fleetflow.repository.DeliveryOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DeliveryOrderService {

    private final DeliveryOrderRepository orderRepository;

    public List<DeliveryOrder> findAll() {
        return orderRepository.findAll();
    }

    public Optional<DeliveryOrder> findById(Long id) {
        return orderRepository.findById(id);
    }

    public Optional<DeliveryOrder> findByOrderId(String orderId) {
        return orderRepository.findByOrderId(orderId);
    }

    public DeliveryOrder save(DeliveryOrder order) {
        return orderRepository.save(order);
    }

    public DeliveryOrder assignToVehicle(String orderId, Long vehicleId) {
        DeliveryOrder order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setAssignedVehicleId(vehicleId);
        order.setStatus(DeliveryOrder.OrderStatus.ASSIGNED);
        return orderRepository.save(order);
    }

    public DeliveryOrder updateStatus(String orderId, DeliveryOrder.OrderStatus status) {
        DeliveryOrder order = orderRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public List<DeliveryOrder> getByStatus(DeliveryOrder.OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public List<DeliveryOrder> getByPriority(DeliveryOrder.OrderPriority priority) {
        return orderRepository.findByPriority(priority);
    }

    public List<DeliveryOrder> getByVehicleId(Long vehicleId) {
        return orderRepository.findByAssignedVehicleId(vehicleId);
    }
}
