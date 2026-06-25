package com.waterstation.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("ticket_redemption")
public class TicketRedemption {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long packageId;
    private Long customerId;
    private Long orderId;
    private Integer redeemedQty;
    private LocalDateTime redemptionDate;
    private String remark;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
