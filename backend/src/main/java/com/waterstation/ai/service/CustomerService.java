package com.waterstation.ai.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.waterstation.ai.common.result.PageResult;
import com.waterstation.ai.dto.CustomerCreateDTO;
import com.waterstation.ai.dto.CustomerUpdateDTO;
import com.waterstation.ai.entity.Customer;
import com.waterstation.ai.vo.CustomerVO;

public interface CustomerService extends IService<Customer> {
    PageResult<CustomerVO> listCustomers(Integer page, Integer size, String keyword, String tier);
    CustomerVO getCustomerById(Long id);
    CustomerVO createCustomer(CustomerCreateDTO dto);
    void updateCustomer(Long id, CustomerUpdateDTO dto);
    void deleteCustomer(Long id);
    void recordPayment(Long id, java.math.BigDecimal amount);
}
