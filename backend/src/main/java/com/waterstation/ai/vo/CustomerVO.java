package com.waterstation.ai.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CustomerVO {
    private Long id;
    private String name;
    private String phone;
    private String address;
    private String tier;
    private BigDecimal outstandingBalance;
    private Integer activeTickets;
    private Integer lifetimeOrders;
    private BigDecimal totalSpent;
    private Integer status;
    private LocalDateTime createdAt;
}
