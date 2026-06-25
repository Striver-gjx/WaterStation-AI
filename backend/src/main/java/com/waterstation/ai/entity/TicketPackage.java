package com.waterstation.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("ticket_package")
public class TicketPackage {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long customerId;
    private Long productId;
    private Integer totalTickets;
    private Integer remainingTickets;
    private BigDecimal pricePaid;
    private BigDecimal unitPrice;
    private String status;
    private String purchaseDate;
    private String expireDate;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
