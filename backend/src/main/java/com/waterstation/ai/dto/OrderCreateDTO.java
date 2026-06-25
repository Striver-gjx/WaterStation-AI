package com.waterstation.ai.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class OrderCreateDTO {
    @NotNull(message = "客户ID不能为空")
    private Long customerId;

    @NotNull(message = "配送地址不能为空")
    private String deliveryAddress;

    private String scheduledDate;
    private String scheduledTimeSlot;
    private String remark;
    private String paymentMethod;

    @NotEmpty(message = "订单明细不能为空")
    private List<OrderItemDTO> items;

    @Data
    public static class OrderItemDTO {
        @NotNull(message = "产品ID不能为空")
        private Long productId;
        @NotNull(message = "数量不能为空")
        private Integer quantity;
    }
}
