package com.fleetflow.controller;

import com.fleetflow.model.DispatchLog;
import com.fleetflow.service.DispatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dispatch")
@RequiredArgsConstructor
public class DispatchController {

    private final DispatchService dispatchService;

    @PostMapping("/auto")
    public List<Map<String, Object>> autoDispatch() {
        return dispatchService.autoDispatch();
    }

    @GetMapping("/logs")
    public List<DispatchLog> getRecentLogs() {
        return dispatchService.getRecentLogs();
    }
}
