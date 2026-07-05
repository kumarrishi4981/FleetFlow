package com.fleetflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteOptimizationResponse {
    private double originalDistanceKm;
    private double optimizedDistanceKm;
    private double savingsPercent;
    private List<Integer> optimizedOrder;
    private List<WaypointDto> optimizedWaypoints;
    private int estimatedDurationMinutes;
}
