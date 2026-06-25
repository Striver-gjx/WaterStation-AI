package com.waterstation.ai.dto;

import lombok.Data;

@Data
public class CustomerUpdateDTO {
    private String name;
    private String phone;
    private String address;
    private String addressDetail;
    private String tier;
    private String companyName;
    private String remark;
    private Integer status;
}
