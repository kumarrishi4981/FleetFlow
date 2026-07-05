package com.fleetflow.service;

import com.fleetflow.dto.RouteOptimizationRequest;
import com.fleetflow.dto.RouteOptimizationResponse;
import com.fleetflow.dto.WaypointDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class RouteOptimizationService {

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double AVG_SPEED_KMH = 30.0;

    /**
     * Calculates the Haversine distance between two geographic points.
     *
     * @return distance in kilometers
     */
    public double haversineDistance(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    /**
     * Optimizes a route using the Nearest-Neighbor TSP heuristic.
     * Starts from the first waypoint, always visits the nearest unvisited waypoint next.
     * Returns before/after distance comparison and reordered waypoints.
     */
    public RouteOptimizationResponse optimizeRoute(RouteOptimizationRequest request) {
        List<Double> lats = request.getWaypointLats();
        List<Double> lngs = request.getWaypointLngs();
        List<String> labels = request.getWaypointLabels();
        int n = lats.size();

        // Edge case: 0 or 1 waypoints
        if (n <= 1) {
            RouteOptimizationResponse response = new RouteOptimizationResponse();
            response.setOriginalDistanceKm(0);
            response.setOptimizedDistanceKm(0);
            response.setSavingsPercent(0);
            response.setOptimizedOrder(n == 0 ? new ArrayList<>() : List.of(0));
            List<WaypointDto> wps = new ArrayList<>();
            if (n == 1) {
                WaypointDto wp = new WaypointDto();
                wp.setLat(lats.get(0));
                wp.setLng(lngs.get(0));
                wp.setLabel(labels != null && !labels.isEmpty() ? labels.get(0) : "Point 0");
                wp.setOriginalIndex(0);
                wps.add(wp);
            }
            response.setOptimizedWaypoints(wps);
            response.setEstimatedDurationMinutes(0);
            return response;
        }

        // Build distance matrix
        double[][] distMatrix = new double[n][n];
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                double dist = haversineDistance(lats.get(i), lngs.get(i), lats.get(j), lngs.get(j));
                distMatrix[i][j] = dist;
                distMatrix[j][i] = dist;
            }
        }

        // Calculate original route distance (visiting waypoints in input order)
        double originalDistance = 0;
        for (int i = 0; i < n - 1; i++) {
            originalDistance += distMatrix[i][i + 1];
        }

        // Nearest-Neighbor TSP heuristic
        boolean[] visited = new boolean[n];
        List<Integer> optimizedOrder = new ArrayList<>();
        int current = 0;
        visited[current] = true;
        optimizedOrder.add(current);

        for (int step = 1; step < n; step++) {
            double nearestDist = Double.MAX_VALUE;
            int nearestIdx = -1;
            for (int j = 0; j < n; j++) {
                if (!visited[j] && distMatrix[current][j] < nearestDist) {
                    nearestDist = distMatrix[current][j];
                    nearestIdx = j;
                }
            }
            visited[nearestIdx] = true;
            optimizedOrder.add(nearestIdx);
            current = nearestIdx;
        }

        // Calculate optimized route distance
        double optimizedDistance = 0;
        for (int i = 0; i < optimizedOrder.size() - 1; i++) {
            optimizedDistance += distMatrix[optimizedOrder.get(i)][optimizedOrder.get(i + 1)];
        }

        // Build optimized waypoints list
        List<WaypointDto> optimizedWaypoints = new ArrayList<>();
        for (int idx : optimizedOrder) {
            WaypointDto wp = new WaypointDto();
            wp.setLat(lats.get(idx));
            wp.setLng(lngs.get(idx));
            wp.setLabel(labels != null && idx < labels.size() ? labels.get(idx) : "Point " + idx);
            wp.setOriginalIndex(idx);
            optimizedWaypoints.add(wp);
        }

        // Calculate savings
        double savings = originalDistance > 0
                ? ((originalDistance - optimizedDistance) / originalDistance) * 100.0
                : 0.0;

        // Estimate duration based on average city speed
        int estimatedMinutes = (int) Math.ceil((optimizedDistance / AVG_SPEED_KMH) * 60);

        RouteOptimizationResponse response = new RouteOptimizationResponse();
        response.setOriginalDistanceKm(Math.round(originalDistance * 100.0) / 100.0);
        response.setOptimizedDistanceKm(Math.round(optimizedDistance * 100.0) / 100.0);
        response.setSavingsPercent(Math.round(savings * 100.0) / 100.0);
        response.setOptimizedOrder(optimizedOrder);
        response.setOptimizedWaypoints(optimizedWaypoints);
        response.setEstimatedDurationMinutes(estimatedMinutes);
        return response;
    }

    /**
     * Dijkstra's shortest path algorithm for point-to-point routing.
     * Given an adjacency matrix (weights), finds shortest path from source to destination.
     *
     * @param adjacencyMatrix NxN matrix where positive values represent edge weights, 0 means no edge
     * @param source          source node index
     * @param destination     destination node index
     * @return shortest distance, or -1 if unreachable
     */
    public double dijkstraShortestPath(double[][] adjacencyMatrix, int source, int destination) {
        int n = adjacencyMatrix.length;
        double[] dist = new double[n];
        boolean[] visited = new boolean[n];
        int[] prev = new int[n];

        Arrays.fill(dist, Double.MAX_VALUE);
        Arrays.fill(prev, -1);
        dist[source] = 0;

        for (int i = 0; i < n; i++) {
            // Find the unvisited node with the smallest distance
            int u = -1;
            double minDist = Double.MAX_VALUE;
            for (int v = 0; v < n; v++) {
                if (!visited[v] && dist[v] < minDist) {
                    minDist = dist[v];
                    u = v;
                }
            }

            if (u == -1) break;
            visited[u] = true;

            if (u == destination) return dist[u];

            // Relax edges
            for (int v = 0; v < n; v++) {
                if (!visited[v] && adjacencyMatrix[u][v] > 0) {
                    double newDist = dist[u] + adjacencyMatrix[u][v];
                    if (newDist < dist[v]) {
                        dist[v] = newDist;
                        prev[v] = u;
                    }
                }
            }
        }

        return dist[destination] == Double.MAX_VALUE ? -1 : dist[destination];
    }
}
