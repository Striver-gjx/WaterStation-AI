package com.waterstation.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("delivery")
public class Delivery {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long orderId;
    private Long driverId;
    private String status;
    private LocalDateTime pickupTime;
    private LocalDateTime deliveredTime;
    private String deliveryPhotoUrl;
    private String signPhotoUrl;
    private BigDecimal gpsLatitude;
    private BigDecimal gpsLongitude;
    private Integer emptyBucketsCollected;
    private Integer customerSigned;
    private String remark;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
