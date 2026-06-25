package com.waterstation.ai.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class TicketSellDTO {
    @NotNull(message = "客户ID不能为空")
    private Long customerId;
    @NotNull(message = "产品ID不能为空")
    private Long productId;
    @NotNull(message = "总张数不能为空")
    @Positive(message = "总张数必须大于0")
    private Integer totalTickets;
    @NotNull(message = "支付金额不能为空")
    private BigDecimal pricePaid;
    private Integer expireDays;
}
