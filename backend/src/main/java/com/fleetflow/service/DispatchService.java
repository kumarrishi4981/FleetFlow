package com.fleetflow.service;

import com.fleetflow.model.*;
import com.fleetflow.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DispatchService {

    private final VehicleRepository vehicleRepository;
    private final DeliveryOrderRepository orderRepository;
    private final RouteRepository routeRepository;
    private final DispatchLogRepository dispatchLogRepository;
    private final RouteOptimizationService routeOptimizationService;

    /**
     * Auto-dispatch: match PENDING orders to nearest IDLE vehicles.
     * Considers vehicle capacity and distance to pickup point.
     */
    public List<Map<String, Object>> autoDispatch() {
        List<DeliveryOrder> pendingOrders = orderRepository.findByStatus(DeliveryOrder.OrderStatus.PENDING);
        List<Vehicle> idleVehicles = vehicleRepository.findByStatus(Vehicle.VehicleStatus.IDLE);
        List<Map<String, Object>> results = new ArrayList<>();

        Set<Long> assignedVehicleIds = new HashSet<>();

        for (DeliveryOrder order : pendingOrders) {
            Vehicle bestVehicle = null;
            double bestDistance = Double.MAX_VALUE;

            for (Vehicle vehicle : idleVehicles) {
                if (assignedVehicleIds.contains(vehicle.getId())) continue;
                if (vehicle.getCurrentLat() == null || vehicle.getCurrentLng() == null) continue;
                if (order.getPickupLat() == null || order.getPickupLng() == null) continue;

                // Check capacity
                if (order.getWeight() != null && vehicle.getCapacity() != null
                        && order.getWeight() > vehicle.getCapacity()) continue;

                double distance = routeOptimizationService.haversineDistance(
                        vehicle.getCurrentLat(), vehicle.getCurrentLng(),
                        order.getPickupLat(), order.getPickupLng()
                );

                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestVehicle = vehicle;
                }
            }

            if (bestVehicle != null) {
                // Assign order to vehicle
                order.setAssignedVehicleId(bestVehicle.getId());
                order.setStatus(DeliveryOrder.OrderStatus.ASSIGNED);
                int estimatedMinutes = (int) Math.ceil((bestDistance / 30.0) * 60);
                order.setEstimatedMinutes(estimatedMinutes);
                orderRepository.save(order);

                // Update vehicle status
                bestVehicle.setStatus(Vehicle.VehicleStatus.ACTIVE);
                vehicleRepository.save(bestVehicle);

                // Create route
                String waypointsJson = String.format(
                        "[{\"lat\":%.6f,\"lng\":%.6f,\"label\":\"Pickup\"},{\"lat\":%.6f,\"lng\":%.6f,\"label\":\"Dropoff\"}]",
                        order.getPickupLat(), order.getPickupLng(),
                        order.getDropoffLat(), order.getDropoffLng()
                );
                Route route = new Route();
                route.setName("Route for " + order.getOrderId());
                route.setVehicleId(bestVehicle.getId());
                route.setWaypoints(waypointsJson);
                double totalDist = bestDistance + routeOptimizationService.haversineDistance(
                        order.getPickupLat(), order.getPickupLng(),
                        order.getDropoffLat(), order.getDropoffLng()
                );
                route.setTotalDistanceKm(Math.round(totalDist * 100.0) / 100.0);
                route.setEstimatedDurationMinutes(estimatedMinutes);
                route.setOptimized(false);
                route.setStatus(Route.RouteStatus.ACTIVE);
                route.setCreatedAt(LocalDateTime.now());
                routeRepository.save(route);

                // Log dispatch
                DispatchLog log = new DispatchLog();
                log.setVehicleId(bestVehicle.getId());
                log.setOrderId(order.getOrderId());
                log.setAction("AUTO_DISPATCH");
                log.setTimestamp(LocalDateTime.now());
                log.setNotes(String.format("Assigned %s to vehicle %s (%.2f km away)",
                        order.getOrderId(), bestVehicle.getPlateNumber(), bestDistance));
                dispatchLogRepository.save(log);

                assignedVehicleIds.add(bestVehicle.getId());

                Map<String, Object> result = new HashMap<>();
                result.put("orderId", order.getOrderId());
                result.put("vehicleId", bestVehicle.getId());
                result.put("vehiclePlate", bestVehicle.getPlateNumber());
                result.put("distanceKm", Math.round(bestDistance * 100.0) / 100.0);
                result.put("estimatedMinutes", estimatedMinutes);
                results.add(result);
            }
        }

        return results;
    }

    /**
     * Get recent dispatch activity logs.
     */
    public List<DispatchLog> getRecentLogs() {
        return dispatchLogRepository.findTop20ByOrderByTimestampDesc();
    }
}
