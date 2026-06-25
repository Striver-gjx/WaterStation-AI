package com.waterstation.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("customer")
public class Customer {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String phone;
    private String address;
    private String addressDetail;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String tier;
    private String companyName;
    private BigDecimal outstandingBalance;
    private Integer activeTickets;
    private Integer lifetimeOrders;
    private BigDecimal totalSpent;
    private String remark;
    private Integer status;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
