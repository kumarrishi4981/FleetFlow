package com.fleetflow.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "routes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Long vehicleId;

    @Column(columnDefinition = "CLOB")
    private String waypoints;

    private Double totalDistanceKm;

    private Integer estimatedDurationMinutes;

    @Column(nullable = false)
    private Boolean optimized;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RouteStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public enum RouteStatus {
        PLANNED, ACTIVE, COMPLETED
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
