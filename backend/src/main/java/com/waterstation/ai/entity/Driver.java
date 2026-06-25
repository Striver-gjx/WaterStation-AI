package com.waterstation.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("driver")
public class Driver {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String phone;
    private String idCard;
    private String avatarUrl;
    private String vehicleType;
    private String vehiclePlate;
    private String serviceArea;
    private Integer maxDailyOrders;
    private BigDecimal currentLatitude;
    private BigDecimal currentLongitude;
    private String status;
    private Integer totalDeliveries;
    private BigDecimal rating;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
