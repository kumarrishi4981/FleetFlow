package com.fleetflow.controller;

import com.fleetflow.dto.DashboardSummary;
import com.fleetflow.model.DeliveryOrder;
import com.fleetflow.model.Route;
import com.fleetflow.model.Vehicle;
import com.fleetflow.repository.DeliveryOrderRepository;
import com.fleetflow.repository.RouteRepository;
import com.fleetflow.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final VehicleRepository vehicleRepository;
    private final DeliveryOrderRepository orderRepository;
    private final RouteRepository routeRepository;

    @GetMapping
    public DashboardSummary getDashboard() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<DeliveryOrder> orders = orderRepository.findAll();
        List<Route> routes = routeRepository.findAll();

        long totalVehicles = vehicles.size();
        long activeVehicles = vehicles.stream().filter(v -> v.getStatus() == Vehicle.VehicleStatus.ACTIVE).count();
        long idleVehicles = vehicles.stream().filter(v -> v.getStatus() == Vehicle.VehicleStatus.IDLE).count();
        long maintenanceVehicles = vehicles.stream().filter(v -> v.getStatus() == Vehicle.VehicleStatus.MAINTENANCE).count();

        long totalOrders = orders.size();
        long pendingOrders = orders.stream().filter(o -> o.getStatus() == DeliveryOrder.OrderStatus.PENDING).count();
        long inTransitOrders = orders.stream().filter(o -> o.getStatus() == DeliveryOrder.OrderStatus.IN_TRANSIT).count();
        long deliveredOrders = orders.stream().filter(o -> o.getStatus() == DeliveryOrder.OrderStatus.DELIVERED).count();

        double completionRate = totalOrders > 0 ? (deliveredOrders * 100.0 / totalOrders) : 0.0;
        completionRate = Math.round(completionRate * 100.0) / 100.0;

        double avgRouteTime = routes.stream()
                .filter(r -> r.getEstimatedDurationMinutes() != null)
                .mapToInt(Route::getEstimatedDurationMinutes)
                .average()
                .orElse(0.0);
        avgRouteTime = Math.round(avgRouteTime * 100.0) / 100.0;

        double totalDistance = routes.stream()
                .filter(r -> r.getTotalDistanceKm() != null)
                .mapToDouble(Route::getTotalDistanceKm)
                .sum();
        totalDistance = Math.round(totalDistance * 100.0) / 100.0;

        DashboardSummary summary = new DashboardSummary();
        summary.setTotalVehicles(totalVehicles);
        summary.setActiveVehicles(activeVehicles);
        summary.setIdleVehicles(idleVehicles);
        summary.setMaintenanceVehicles(maintenanceVehicles);
        summary.setTotalOrders(totalOrders);
        summary.setPendingOrders(pendingOrders);
        summary.setInTransitOrders(inTransitOrders);
        summary.setDeliveredOrders(deliveredOrders);
        summary.setCompletionRate(completionRate);
        summary.setAvgRouteTimeMinutes(avgRouteTime);
        summary.setTotalDistanceCoveredKm(totalDistance);
        return summary;
    }
}
