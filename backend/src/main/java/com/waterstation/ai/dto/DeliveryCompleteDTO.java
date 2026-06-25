package com.waterstation.ai.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class DeliveryCompleteDTO {
    private String deliveryPhotoUrl;
    private String signPhotoUrl;
    @NotNull(message = "GPS纬度不能为空")
    private BigDecimal gpsLatitude;
    @NotNull(message = "GPS经度不能为空")
    private BigDecimal gpsLongitude;
    @NotNull(message = "回收空桶数量不能为空")
    private Integer emptyBucketsCollected;
    @NotNull(message = "签收状态不能为空")
    private Boolean customerSigned;
    private String remark;
}
