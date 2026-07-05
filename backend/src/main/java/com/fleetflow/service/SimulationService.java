package com.fleetflow.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetflow.model.Route;
import com.fleetflow.model.Vehicle;
import com.fleetflow.repository.RouteRepository;
import com.fleetflow.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SimulationService {

    private final VehicleRepository vehicleRepository;
    private final RouteRepository routeRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    private static final double MOVE_STEP = 0.0008; // ~80 meters per tick

    @Scheduled(fixedRate = 3000)
    public void simulateVehicleMovement() {
        List<Vehicle> activeVehicles = vehicleRepository.findByStatus(Vehicle.VehicleStatus.ACTIVE);

        for (Vehicle vehicle : activeVehicles) {
            try {
                List<Route> activeRoutes = routeRepository.findByVehicleId(vehicle.getId())
                        .stream()
                        .filter(r -> r.getStatus() == Route.RouteStatus.ACTIVE)
                        .toList();

                if (activeRoutes.isEmpty() || vehicle.getCurrentLat() == null || vehicle.getCurrentLng() == null) {
                    continue;
                }

                Route route = activeRoutes.get(0);
                if (route.getWaypoints() == null || route.getWaypoints().isEmpty()) continue;

                // Parse waypoints from JSON
                List<Map<String, Object>> waypoints = objectMapper.readValue(
                        route.getWaypoints(),
                        new TypeReference<List<Map<String, Object>>>() {}
                );

                if (waypoints.isEmpty()) continue;

                // Move towards the last waypoint (destination)
                Map<String, Object> targetWp = waypoints.get(waypoints.size() - 1);
                double targetLat = ((Number) targetWp.get("lat")).doubleValue();
                double targetLng = ((Number) targetWp.get("lng")).doubleValue();

                double currentLat = vehicle.getCurrentLat();
                double currentLng = vehicle.getCurrentLng();

                double dLat = targetLat - currentLat;
                double dLng = targetLng - currentLng;
                double distance = Math.sqrt(dLat * dLat + dLng * dLng);

                if (distance < MOVE_STEP) {
                    // Arrived at destination
                    vehicle.setCurrentLat(targetLat);
                    vehicle.setCurrentLng(targetLng);
                    route.setStatus(Route.RouteStatus.COMPLETED);
                    routeRepository.save(route);
                } else {
                    // Move towards target
                    double ratio = MOVE_STEP / distance;
                    vehicle.setCurrentLat(currentLat + dLat * ratio);
                    vehicle.setCurrentLng(currentLng + dLng * ratio);
                }

                // Simulate fuel consumption
                if (vehicle.getFuelLevel() != null && vehicle.getFuelLevel() > 0) {
                    vehicle.setFuelLevel(Math.max(0, vehicle.getFuelLevel() - 1));
                }

                vehicleRepository.save(vehicle);

                // Send WebSocket update
                Map<String, Object> update = new HashMap<>();
                update.put("vehicleId", vehicle.getId());
                update.put("plateNumber", vehicle.getPlateNumber());
                update.put("lat", vehicle.getCurrentLat());
                update.put("lng", vehicle.getCurrentLng());
                update.put("fuelLevel", vehicle.getFuelLevel());
                update.put("status", vehicle.getStatus().name());

                messagingTemplate.convertAndSend("/topic/vehicles", update);

            } catch (Exception e) {
                log.error("Error simulating vehicle {}: {}", vehicle.getId(), e.getMessage());
            }
        }
    }
}
