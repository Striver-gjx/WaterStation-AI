package com.waterstation.ai.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderVO {
    private Long id;
    private String orderNo;
    private Long customerId;
    private String customerName;
    private Long driverId;
    private String driverName;
    private BigDecimal totalAmount;
    private String status;
    private String paymentMethod;
    private String deliveryAddress;
    private String scheduledDate;
    private String scheduledTimeSlot;
    private LocalDateTime createdAt;
}
