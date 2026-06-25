package com.waterstation.ai.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductVO {
    private Long id;
    private String name;
    private String category;
    private String specification;
    private BigDecimal unitPrice;
    private Integer stock;
    private Integer maxStock;
    private Integer minStockAlert;
    private String status;
    private String imageUrl;
    private String description;
    private Integer sortOrder;
}
