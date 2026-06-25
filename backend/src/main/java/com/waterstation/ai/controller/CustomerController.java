package com.waterstation.ai.controller;

import com.waterstation.ai.common.result.PageResult;
import com.waterstation.ai.common.result.Result;
import com.waterstation.ai.dto.CustomerCreateDTO;
import com.waterstation.ai.dto.CustomerUpdateDTO;
import com.waterstation.ai.service.CustomerService;
import com.waterstation.ai.vo.CustomerVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public Result<PageResult<CustomerVO>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String tier) {
        return Result.success(customerService.listCustomers(page, size, keyword, tier));
    }

    @GetMapping("/{id}")
    public Result<CustomerVO> get(@PathVariable Long id) {
        return Result.success(customerService.getCustomerById(id));
    }

    @PostMapping
    public Result<CustomerVO> create(@Valid @RequestBody CustomerCreateDTO dto) {
        return Result.success(customerService.createCustomer(dto));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody CustomerUpdateDTO dto) {
        customerService.updateCustomer(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return Result.success();
    }

    @PostMapping("/{id}/payment")
    public Result<Void> recordPayment(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        customerService.recordPayment(id, amount);
        return Result.success();
    }
}
