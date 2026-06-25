package com.waterstation.ai.dto;

import lombok.Data;

@Data
public class DriverUpdateDTO {
    private String name;
    private String phone;
    private String vehicleType;
    private String vehiclePlate;
    private String serviceArea;
    private Integer maxDailyOrders;
}
