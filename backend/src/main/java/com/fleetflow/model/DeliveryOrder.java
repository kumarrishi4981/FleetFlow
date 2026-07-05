package com.fleetflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderId;

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String pickupAddress;

    private Double pickupLat;
    private Double pickupLng;

    @Column(nullable = false)
    private String dropoffAddress;

    private Double dropoffLat;
    private Double dropoffLng;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderPriority priority;

    private Double weight;

    private Integer estimatedMinutes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private Long assignedVehicleId;

    public enum OrderStatus {
        PENDING, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED
    }

    public enum OrderPriority {
        LOW, MEDIUM, HIGH, URGENT
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
