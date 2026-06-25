package com.waterstation.ai.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("bucket")
public class Bucket {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long customerId;
    private String bucketType;
    private BigDecimal depositAmount;
    private String status;
    private String issuedDate;
    private String returnedDate;
    private String remark;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
