package com.fleetflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WaypointDto {
    private double lat;
    private double lng;
    private String label;
    private int originalIndex;
}
