package com.fleetflow.config;

import com.fleetflow.model.*;
import com.fleetflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final VehicleRepository vehicleRepository;
    private final DeliveryOrderRepository orderRepository;
    private final RouteRepository routeRepository;
    private final DispatchLogRepository dispatchLogRepository;

    @Override
    public void run(String... args) {
        log.info("=== FleetFlow DataLoader: Seeding database ===");
        seedVehicles();
        seedOrders();
        seedRoutes();
        seedDispatchLogs();
        log.info("=== FleetFlow DataLoader: Seeding complete ===");
    }

    private void seedVehicles() {
        List<Vehicle> vehicles = List.of(
                // 7 ACTIVE vehicles
                createVehicle("DL01AB1234", Vehicle.VehicleType.TRUCK, Vehicle.VehicleStatus.ACTIVE,
                        28.6139, 77.2090, 85, 5000.0, "Rajesh Kumar", 40.0),
                createVehicle("DL02CD5678", Vehicle.VehicleType.TRUCK, Vehicle.VehicleStatus.ACTIVE,
                        28.6353, 77.2250, 72, 4500.0, "Amit Singh", 38.0),
                createVehicle("DL03EF9012", Vehicle.VehicleType.VAN, Vehicle.VehicleStatus.ACTIVE,
                        28.5921, 77.2167, 90, 1500.0, "Suresh Yadav", 45.0),
                createVehicle("DL04GH3456", Vehicle.VehicleType.VAN, Vehicle.VehicleStatus.ACTIVE,
                        28.6508, 77.1855, 65, 1200.0, "Vikram Patel", 42.0),
                createVehicle("DL05IJ7890", Vehicle.VehicleType.BIKE, Vehicle.VehicleStatus.ACTIVE,
                        28.6280, 77.2195, 95, 20.0, "Arjun Mehra", 55.0),
                createVehicle("DL06KL2345", Vehicle.VehicleType.VAN, Vehicle.VehicleStatus.ACTIVE,
                        28.5685, 77.2510, 78, 1000.0, "Deepak Sharma", 40.0),
                createVehicle("DL07MN6789", Vehicle.VehicleType.TRUCK, Vehicle.VehicleStatus.ACTIVE,
                        28.6692, 77.2734, 60, 6000.0, "Rohit Verma", 35.0),
                // 3 IDLE vehicles
                createVehicle("DL08OP1122", Vehicle.VehicleType.VAN, Vehicle.VehicleStatus.IDLE,
                        28.6100, 77.2300, 88, 1300.0, "Manoj Tiwari", 43.0),
                createVehicle("DL09QR3344", Vehicle.VehicleType.BIKE, Vehicle.VehicleStatus.IDLE,
                        28.6450, 77.2100, 92, 15.0, "Pradeep Joshi", 50.0),
                createVehicle("DL10ST5566", Vehicle.VehicleType.TRUCK, Vehicle.VehicleStatus.IDLE,
                        28.5800, 77.1950, 70, 5500.0, "Sanjay Gupta", 36.0),
                // 2 MAINTENANCE vehicles
                createVehicle("DL11UV7788", Vehicle.VehicleType.TRUCK, Vehicle.VehicleStatus.MAINTENANCE,
                        28.6200, 77.2400, 30, 4800.0, "Karan Malhotra", 0.0),
                createVehicle("DL12WX9900", Vehicle.VehicleType.BIKE, Vehicle.VehicleStatus.MAINTENANCE,
                        28.5950, 77.2050, 15, 18.0, "Nitin Agarwal", 0.0)
        );
        vehicleRepository.saveAll(vehicles);
        log.info("Seeded {} vehicles", vehicles.size());
    }

    private Vehicle createVehicle(String plate, Vehicle.VehicleType type, Vehicle.VehicleStatus status,
                                   double lat, double lng, int fuel, double capacity, String driver, double speed) {
        Vehicle v = new Vehicle();
        v.setPlateNumber(plate);
        v.setType(type);
        v.setStatus(status);
        v.setCurrentLat(lat);
        v.setCurrentLng(lng);
        v.setFuelLevel(fuel);
        v.setCapacity(capacity);
        v.setDriverName(driver);
        v.setSpeed(speed);
        return v;
    }

    private void seedOrders() {
        LocalDateTime now = LocalDateTime.now();
        List<DeliveryOrder> orders = List.of(
                // 8 PENDING orders
                createOrder("FF-1001", "Priya Enterprises", "Chandni Chowk, Delhi", 28.6506, 77.2309,
                        "Saket Mall, Delhi", 28.5244, 77.2167,
                        DeliveryOrder.OrderStatus.PENDING, DeliveryOrder.OrderPriority.HIGH,
                        250.0, null, now.minusHours(2), null),
                createOrder("FF-1002", "Sharma Electronics", "Karol Bagh, Delhi", 28.6519, 77.1905,
                        "Dwarka Sec-21, Delhi", 28.5733, 77.0424,
                        DeliveryOrder.OrderStatus.PENDING, DeliveryOrder.OrderPriority.MEDIUM,
                        120.0, null, now.minusHours(1), null),
                createOrder("FF-1003", "Kumar Textiles", "Rajouri Garden, Delhi", 28.6492, 77.1212,
                        "Lajpat Nagar, Delhi", 28.5700, 77.2436,
                        DeliveryOrder.OrderStatus.PENDING, DeliveryOrder.OrderPriority.URGENT,
                        500.0, null, now.minusMinutes(45), null),
                createOrder("FF-1004", "Agarwal Foods", "Pitampura, Delhi", 28.6969, 77.1316,
                        "Vasant Kunj, Delhi", 28.5194, 77.1569,
                        DeliveryOrder.OrderStatus.PENDING, DeliveryOrder.OrderPriority.LOW,
                        80.0, null, now.minusMinutes(30), null),
                createOrder("FF-1005", "Delhi Book Store", "ITO, Delhi", 28.6285, 77.2413,
                        "Janakpuri, Delhi", 28.6219, 77.0818,
                        DeliveryOrder.OrderStatus.PENDING, DeliveryOrder.OrderPriority.MEDIUM,
                        35.0, null, now.minusMinutes(20), null),
                createOrder("FF-1006", "Gupta Pharma", "Hauz Khas, Delhi", 28.5494, 77.2001,
                        "Rohini Sec-3, Delhi", 28.7158, 77.1171,
                        DeliveryOrder.OrderStatus.PENDING, DeliveryOrder.OrderPriority.HIGH,
                        10.0, null, now.minusMinutes(15), null),
                createOrder("FF-1007", "Sunrise Logistics", "Nehru Place, Delhi", 28.5491, 77.2533,
                        "Shalimar Bagh, Delhi", 28.7186, 77.1574,
                        DeliveryOrder.OrderStatus.PENDING, DeliveryOrder.OrderPriority.LOW,
                        950.0, null, now.minusMinutes(10), null),
                createOrder("FF-1008", "Metro Supplies", "Connaught Place, Delhi", 28.6315, 77.2167,
                        "Mayur Vihar Ph-1, Delhi", 28.6067, 77.2988,
                        DeliveryOrder.OrderStatus.PENDING, DeliveryOrder.OrderPriority.MEDIUM,
                        200.0, null, now.minusMinutes(5), null),
                // 4 ASSIGNED orders
                createOrder("FF-1009", "Royal Furniture", "Kirti Nagar, Delhi", 28.6575, 77.1500,
                        "Defence Colony, Delhi", 28.5740, 77.2330,
                        DeliveryOrder.OrderStatus.ASSIGNED, DeliveryOrder.OrderPriority.HIGH,
                        1500.0, 45, now.minusHours(3), 4L),
                createOrder("FF-1010", "Fresh Farms", "Azadpur Mandi, Delhi", 28.7137, 77.1770,
                        "Green Park, Delhi", 28.5590, 77.2069,
                        DeliveryOrder.OrderStatus.ASSIGNED, DeliveryOrder.OrderPriority.URGENT,
                        300.0, 55, now.minusHours(2), 3L),
                createOrder("FF-1011", "TechHub India", "Okhla Industrial, Delhi", 28.5308, 77.2707,
                        "Nehru Place, Delhi", 28.5491, 77.2533,
                        DeliveryOrder.OrderStatus.ASSIGNED, DeliveryOrder.OrderPriority.MEDIUM,
                        15.0, 20, now.minusHours(1), 5L),
                createOrder("FF-1012", "City Movers", "Sarai Rohilla, Delhi", 28.6625, 77.1756,
                        "Malviya Nagar, Delhi", 28.5321, 77.2100,
                        DeliveryOrder.OrderStatus.ASSIGNED, DeliveryOrder.OrderPriority.LOW,
                        2000.0, 60, now.minusHours(4), 6L),
                // 3 IN_TRANSIT orders
                createOrder("FF-1013", "Spice Route Ltd", "Chandni Chowk, Delhi", 28.6506, 77.2309,
                        "Greater Kailash, Delhi", 28.5430, 77.2432,
                        DeliveryOrder.OrderStatus.IN_TRANSIT, DeliveryOrder.OrderPriority.HIGH,
                        180.0, 35, now.minusHours(5), 1L),
                createOrder("FF-1014", "AutoParts Express", "Kashmere Gate, Delhi", 28.6663, 77.2282,
                        "Sarita Vihar, Delhi", 28.5310, 77.2870,
                        DeliveryOrder.OrderStatus.IN_TRANSIT, DeliveryOrder.OrderPriority.MEDIUM,
                        800.0, 50, now.minusHours(4), 2L),
                createOrder("FF-1015", "QuickMed Supplies", "Civil Lines, Delhi", 28.6795, 77.2232,
                        "Mehrauli, Delhi", 28.5245, 77.1855,
                        DeliveryOrder.OrderStatus.IN_TRANSIT, DeliveryOrder.OrderPriority.URGENT,
                        5.0, 40, now.minusHours(3), 7L),
                // 5 DELIVERED orders
                createOrder("FF-1016", "Delhi Dairy", "Model Town, Delhi", 28.7100, 77.1929,
                        "Sarojini Nagar, Delhi", 28.5782, 77.1973,
                        DeliveryOrder.OrderStatus.DELIVERED, DeliveryOrder.OrderPriority.LOW,
                        400.0, 40, now.minusHours(8), 1L),
                createOrder("FF-1017", "Paper World", "Shahdara, Delhi", 28.6733, 77.2895,
                        "Connaught Place, Delhi", 28.6315, 77.2167,
                        DeliveryOrder.OrderStatus.DELIVERED, DeliveryOrder.OrderPriority.MEDIUM,
                        100.0, 30, now.minusHours(7), 2L),
                createOrder("FF-1018", "Crafts Corner", "Laxmi Nagar, Delhi", 28.6304, 77.2776,
                        "South Extension, Delhi", 28.5770, 77.2240,
                        DeliveryOrder.OrderStatus.DELIVERED, DeliveryOrder.OrderPriority.LOW,
                        50.0, 25, now.minusHours(6), 3L),
                createOrder("FF-1019", "Green Grocers", "Punjabi Bagh, Delhi", 28.6667, 77.1315,
                        "Chanakyapuri, Delhi", 28.5856, 77.1747,
                        DeliveryOrder.OrderStatus.DELIVERED, DeliveryOrder.OrderPriority.HIGH,
                        200.0, 35, now.minusHours(10), 5L),
                createOrder("FF-1020", "Steel Works", "Wazirpur, Delhi", 28.6975, 77.1650,
                        "Patel Nagar, Delhi", 28.6506, 77.1718,
                        DeliveryOrder.OrderStatus.DELIVERED, DeliveryOrder.OrderPriority.MEDIUM,
                        3000.0, 20, now.minusHours(9), 4L)
        );
        orderRepository.saveAll(orders);
        log.info("Seeded {} orders", orders.size());
    }

    private DeliveryOrder createOrder(String orderId, String customer, String pickupAddr,
                                       double pickupLat, double pickupLng,
                                       String dropoffAddr, double dropoffLat, double dropoffLng,
                                       DeliveryOrder.OrderStatus status, DeliveryOrder.OrderPriority priority,
                                       double weight, Integer estimatedMin, LocalDateTime createdAt, Long vehicleId) {
        DeliveryOrder o = new DeliveryOrder();
        o.setOrderId(orderId);
        o.setCustomerName(customer);
        o.setPickupAddress(pickupAddr);
        o.setPickupLat(pickupLat);
        o.setPickupLng(pickupLng);
        o.setDropoffAddress(dropoffAddr);
        o.setDropoffLat(dropoffLat);
        o.setDropoffLng(dropoffLng);
        o.setStatus(status);
        o.setPriority(priority);
        o.setWeight(weight);
        o.setEstimatedMinutes(estimatedMin);
        o.setCreatedAt(createdAt);
        o.setAssignedVehicleId(vehicleId);
        return o;
    }

    private void seedRoutes() {
        LocalDateTime now = LocalDateTime.now();

        // Route for Vehicle 1 (FF-1013: Chandni Chowk -> Greater Kailash)
        Route r1 = new Route();
        r1.setName("Chandni Chowk to Greater Kailash");
        r1.setVehicleId(1L);
        r1.setWaypoints("[{\"lat\":28.6506,\"lng\":77.2309,\"label\":\"Chandni Chowk\"},{\"lat\":28.6315,\"lng\":77.2167,\"label\":\"CP\"},{\"lat\":28.5921,\"lng\":77.2167,\"label\":\"Lodhi Road\"},{\"lat\":28.5430,\"lng\":77.2432,\"label\":\"Greater Kailash\"}]");
        r1.setTotalDistanceKm(14.5);
        r1.setEstimatedDurationMinutes(35);
        r1.setOptimized(true);
        r1.setStatus(Route.RouteStatus.ACTIVE);
        r1.setCreatedAt(now.minusHours(5));

        // Route for Vehicle 2 (FF-1014: Kashmere Gate -> Sarita Vihar)
        Route r2 = new Route();
        r2.setName("Kashmere Gate to Sarita Vihar");
        r2.setVehicleId(2L);
        r2.setWaypoints("[{\"lat\":28.6663,\"lng\":77.2282,\"label\":\"Kashmere Gate\"},{\"lat\":28.6285,\"lng\":77.2413,\"label\":\"ITO\"},{\"lat\":28.5800,\"lng\":77.2600,\"label\":\"Ashram\"},{\"lat\":28.5310,\"lng\":77.2870,\"label\":\"Sarita Vihar\"}]");
        r2.setTotalDistanceKm(18.2);
        r2.setEstimatedDurationMinutes(50);
        r2.setOptimized(true);
        r2.setStatus(Route.RouteStatus.ACTIVE);
        r2.setCreatedAt(now.minusHours(4));

        // Route for Vehicle 7 (FF-1015: Civil Lines -> Mehrauli)
        Route r3 = new Route();
        r3.setName("Civil Lines to Mehrauli");
        r3.setVehicleId(7L);
        r3.setWaypoints("[{\"lat\":28.6795,\"lng\":77.2232,\"label\":\"Civil Lines\"},{\"lat\":28.6315,\"lng\":77.2167,\"label\":\"Rajpath\"},{\"lat\":28.5782,\"lng\":77.1973,\"label\":\"AIIMS\"},{\"lat\":28.5245,\"lng\":77.1855,\"label\":\"Mehrauli\"}]");
        r3.setTotalDistanceKm(21.0);
        r3.setEstimatedDurationMinutes(40);
        r3.setOptimized(true);
        r3.setStatus(Route.RouteStatus.ACTIVE);
        r3.setCreatedAt(now.minusHours(3));

        routeRepository.saveAll(List.of(r1, r2, r3));
        log.info("Seeded 3 routes");
    }

    private void seedDispatchLogs() {
        LocalDateTime now = LocalDateTime.now();
        List<DispatchLog> logs = List.of(
                createLog(1L, "FF-1013", "AUTO_DISPATCH", now.minusHours(5),
                        "Assigned FF-1013 to vehicle DL01AB1234 (2.3 km away)"),
                createLog(2L, "FF-1014", "AUTO_DISPATCH", now.minusHours(4),
                        "Assigned FF-1014 to vehicle DL02CD5678 (3.1 km away)"),
                createLog(7L, "FF-1015", "AUTO_DISPATCH", now.minusHours(3),
                        "Assigned FF-1015 to vehicle DL07MN6789 (1.8 km away)"),
                createLog(1L, "FF-1013", "PICKED_UP", now.minusHours(4).minusMinutes(30),
                        "Package picked up from Chandni Chowk"),
                createLog(2L, "FF-1014", "PICKED_UP", now.minusHours(3).minusMinutes(30),
                        "Package picked up from Kashmere Gate"),
                createLog(7L, "FF-1015", "PICKED_UP", now.minusHours(2).minusMinutes(30),
                        "Package picked up from Civil Lines"),
                createLog(1L, "FF-1016", "DELIVERED", now.minusHours(8),
                        "Delivered to Sarojini Nagar successfully"),
                createLog(2L, "FF-1017", "DELIVERED", now.minusHours(7),
                        "Delivered to Connaught Place successfully"),
                createLog(3L, "FF-1018", "DELIVERED", now.minusHours(6),
                        "Delivered to South Extension successfully"),
                createLog(5L, "FF-1019", "DELIVERED", now.minusHours(10),
                        "Delivered to Chanakyapuri successfully"),
                createLog(4L, "FF-1020", "DELIVERED", now.minusHours(9),
                        "Delivered to Patel Nagar successfully"),
                createLog(null, null, "SYSTEM_START", now,
                        "FleetFlow dispatch system initialized")
        );
        dispatchLogRepository.saveAll(logs);
        log.info("Seeded {} dispatch logs", logs.size());
    }

    private DispatchLog createLog(Long vehicleId, String orderId, String action,
                                   LocalDateTime timestamp, String notes) {
        DispatchLog log = new DispatchLog();
        log.setVehicleId(vehicleId);
        log.setOrderId(orderId);
        log.setAction(action);
        log.setTimestamp(timestamp);
        log.setNotes(notes);
        return log;
    }
}
