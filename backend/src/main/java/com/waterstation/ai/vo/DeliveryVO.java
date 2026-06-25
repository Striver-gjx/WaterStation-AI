package com.waterstation.ai.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DeliveryVO {
    private Long id;
    private Long orderId;
    private Long driverId;
    private String driverName;
    private String status;
    private LocalDateTime pickupTime;
    private LocalDateTime deliveredTime;
    private String deliveryPhotoUrl;
    private String signPhotoUrl;
    private BigDecimal gpsLatitude;
    private BigDecimal gpsLongitude;
    private Integer emptyBucketsCollected;
    private Boolean customerSigned;
    private String remark;
}
