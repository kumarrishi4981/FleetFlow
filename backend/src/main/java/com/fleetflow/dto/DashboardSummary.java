package com.fleetflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummary {
    private long totalVehicles;
    private long activeVehicles;
    private long idleVehicles;
    private long maintenanceVehicles;
    private long totalOrders;
    private long pendingOrders;
    private long inTransitOrders;
    private long deliveredOrders;
    private double completionRate;
    private double avgRouteTimeMinutes;
    private double totalDistanceCoveredKm;
}
