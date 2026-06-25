package com.waterstation.ai.vo;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BucketVO {
    private Long id;
    private Long customerId;
    private String customerName;
    private String bucketType;
    private BigDecimal depositAmount;
    private String status;
    private String issuedDate;
    private String returnedDate;
}
