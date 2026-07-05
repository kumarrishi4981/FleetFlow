package com.fleetflow.controller;

import com.fleetflow.dto.RouteOptimizationRequest;
import com.fleetflow.dto.RouteOptimizationResponse;
import com.fleetflow.model.Route;
import com.fleetflow.repository.RouteRepository;
import com.fleetflow.service.RouteOptimizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteRepository routeRepository;
    private final RouteOptimizationService routeOptimizationService;

    @GetMapping
    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Route> getRouteById(@PathVariable Long id) {
        return routeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/optimize")
    public RouteOptimizationResponse optimizeRoute(@RequestBody RouteOptimizationRequest request) {
        return routeOptimizationService.optimizeRoute(request);
    }
}
