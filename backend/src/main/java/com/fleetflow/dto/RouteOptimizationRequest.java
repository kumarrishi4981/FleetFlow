package com.fleetflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteOptimizationRequest {
    private Long vehicleId;
    private List<Double> waypointLats;
    private List<Double> waypointLngs;
    private List<String> waypointLabels;
}
