package com.waterstation.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DriverCreateDTO {
    @NotBlank(message = "配送员姓名不能为空")
    private String name;
    @NotBlank(message = "手机号不能为空")
    private String phone;
    private String idCard;
    private String vehicleType;
    private String vehiclePlate;
    private String serviceArea;
    private Integer maxDailyOrders;
}
