package com.fleetflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String plateNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleStatus status;

    private Double currentLat;
    private Double currentLng;

    @Column(nullable = false)
    private Integer fuelLevel;

    @Column(nullable = false)
    private Double capacity;

    @Column(nullable = false)
    private String driverName;

    @Column(nullable = false)
    private Double speed;

    public enum VehicleType {
        TRUCK, VAN, BIKE
    }

    public enum VehicleStatus {
        ACTIVE, IDLE, MAINTENANCE, OUT_OF_SERVICE
    }
}
