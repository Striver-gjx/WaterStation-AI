package com.waterstation.ai.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductUpdateDTO {
    private String name;
    private String category;
    private String specification;
    private BigDecimal unitPrice;
    private BigDecimal costPrice;
    private Integer maxStock;
    private Integer minStockAlert;
    private String imageUrl;
    private String description;
    private Integer sortOrder;
}
