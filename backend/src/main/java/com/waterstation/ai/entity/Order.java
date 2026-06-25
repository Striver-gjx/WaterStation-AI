package com.waterstation.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("`order`")
public class Order {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String orderNo;
    private Long customerId;
    private Long driverId;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private String status;
    private String paymentMethod;
    private String deliveryAddress;
    private BigDecimal deliveryLatitude;
    private BigDecimal deliveryLongitude;
    private String scheduledDate;
    private String scheduledTimeSlot;
    private String remark;
    private String cancelReason;
    private LocalDateTime completedAt;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
