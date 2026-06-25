package com.waterstation.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductCreateDTO {
    @NotBlank(message = "产品名称不能为空")
    private String name;
    private String category;
    private String specification;
    @NotNull(message = "单价不能为空")
    private BigDecimal unitPrice;
    private BigDecimal costPrice;
    private Integer stock;
    private Integer maxStock;
    private Integer minStockAlert;
    private String imageUrl;
    private String description;
}
