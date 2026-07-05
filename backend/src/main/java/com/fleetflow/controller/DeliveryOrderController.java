package com.fleetflow.controller;

import com.fleetflow.model.DeliveryOrder;
import com.fleetflow.service.DeliveryOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class DeliveryOrderController {

    private final DeliveryOrderService orderService;

    @GetMapping
    public List<DeliveryOrder> getAllOrders() {
        return orderService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryOrder> getOrderById(@PathVariable Long id) {
        return orderService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public DeliveryOrder createOrder(@RequestBody DeliveryOrder order) {
        return orderService.save(order);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<DeliveryOrder> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            DeliveryOrder order = orderService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            DeliveryOrder.OrderStatus status = DeliveryOrder.OrderStatus.valueOf(body.get("status"));
            return ResponseEntity.ok(orderService.updateStatus(order.getOrderId(), status));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/assign/{vehicleId}")
    public ResponseEntity<DeliveryOrder> assignToVehicle(@PathVariable Long id, @PathVariable Long vehicleId) {
        try {
            DeliveryOrder order = orderService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            return ResponseEntity.ok(orderService.assignToVehicle(order.getOrderId(), vehicleId));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
