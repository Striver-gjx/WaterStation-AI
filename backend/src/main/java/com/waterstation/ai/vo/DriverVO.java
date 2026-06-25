package com.waterstation.ai.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DriverVO {
    private Long id;
    private String name;
    private String phone;
    private String vehicleType;
    private String vehiclePlate;
    private String serviceArea;
    private Integer maxDailyOrders;
    private String status;
    private Integer totalDeliveries;
    private BigDecimal rating;
    private BigDecimal currentLatitude;
    private BigDecimal currentLongitude;
}
