package com.waterstation.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CustomerCreateDTO {
    @NotBlank(message = "客户姓名不能为空")
    private String name;

    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;

    @NotBlank(message = "地址不能为空")
    private String address;

    private String addressDetail;
    private String tier;
    private String companyName;
    private String remark;
}
