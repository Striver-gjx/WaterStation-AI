package com.waterstation.ai.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class TicketRedeemDTO {
    @NotNull(message = "套餐ID不能为空")
    private Long packageId;
    @NotNull(message = "兑换数量不能为空")
    @Positive(message = "兑换数量必须大于0")
    private Integer redeemedQty;
    private String remark;
}
