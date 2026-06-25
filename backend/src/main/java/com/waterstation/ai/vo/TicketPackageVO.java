package com.waterstation.ai.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TicketPackageVO {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long productId;
    private String productName;
    private Integer totalTickets;
    private Integer remainingTickets;
    private BigDecimal pricePaid;
    private BigDecimal unitPrice;
    private String status;
    private String purchaseDate;
    private String expireDate;
}
