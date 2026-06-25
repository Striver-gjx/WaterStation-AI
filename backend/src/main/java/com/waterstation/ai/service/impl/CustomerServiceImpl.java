package com.waterstation.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.waterstation.ai.common.exception.BusinessException;
import com.waterstation.ai.common.result.PageResult;
import com.waterstation.ai.dto.CustomerCreateDTO;
import com.waterstation.ai.dto.CustomerUpdateDTO;
import com.waterstation.ai.entity.Customer;
import com.waterstation.ai.mapper.CustomerMapper;
import com.waterstation.ai.service.CustomerService;
import com.waterstation.ai.vo.CustomerVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl extends ServiceImpl<CustomerMapper, Customer> implements CustomerService {

    @Override
    public PageResult<CustomerVO> listCustomers(Integer page, Integer size, String keyword, String tier) {
        LambdaQueryWrapper<Customer> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w.like(Customer::getName, keyword)
                    .or().like(Customer::getPhone, keyword));
        }
        if (StringUtils.hasText(tier)) {
            wrapper.eq(Customer::getTier, tier);
        }
        wrapper.orderByDesc(Customer::getCreatedAt);

        Page<Customer> pageResult = page(new Page<>(page, size), wrapper);
        List<CustomerVO> voList = pageResult.getRecords().stream()
                .map(this::toVO)
                .toList();

        return PageResult.of(pageResult.getTotal(), voList);
    }

    @Override
    public CustomerVO getCustomerById(Long id) {
        Customer customer = getById(id);
        if (customer == null) {
            throw new BusinessException("客户不存在");
        }
        return toVO(customer);
    }

    @Override
    public CustomerVO createCustomer(CustomerCreateDTO dto) {
        long count = count(new LambdaQueryWrapper<Customer>().eq(Customer::getPhone, dto.getPhone()));
        if (count > 0) {
            throw new BusinessException("手机号已存在");
        }

        Customer customer = new Customer();
        BeanUtils.copyProperties(dto, customer);
        customer.setTier(dto.getTier() != null ? dto.getTier() : "REGULAR");
        customer.setOutstandingBalance(BigDecimal.ZERO);
        customer.setActiveTickets(0);
        customer.setLifetimeOrders(0);
        customer.setTotalSpent(BigDecimal.ZERO);
        customer.setStatus(1);
        save(customer);

        return toVO(customer);
    }

    @Override
    public void updateCustomer(Long id, CustomerUpdateDTO dto) {
        Customer customer = getById(id);
        if (customer == null) {
            throw new BusinessException("客户不存在");
        }

        if (StringUtils.hasText(dto.getName())) customer.setName(dto.getName());
        if (StringUtils.hasText(dto.getPhone())) customer.setPhone(dto.getPhone());
        if (StringUtils.hasText(dto.getAddress())) customer.setAddress(dto.getAddress());
        if (dto.getAddressDetail() != null) customer.setAddressDetail(dto.getAddressDetail());
        if (StringUtils.hasText(dto.getTier())) customer.setTier(dto.getTier());
        if (dto.getCompanyName() != null) customer.setCompanyName(dto.getCompanyName());
        if (dto.getRemark() != null) customer.setRemark(dto.getRemark());
        if (dto.getStatus() != null) customer.setStatus(dto.getStatus());

        updateById(customer);
    }

    @Override
    public void deleteCustomer(Long id) {
        if (getById(id) == null) {
            throw new BusinessException("客户不存在");
        }
        removeById(id);
    }

    @Override
    public void recordPayment(Long id, BigDecimal amount) {
        Customer customer = getById(id);
        if (customer == null) {
            throw new BusinessException("客户不存在");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("还款金额必须大于0");
        }

        BigDecimal newBalance = customer.getOutstandingBalance().subtract(amount);
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            newBalance = BigDecimal.ZERO;
        }
        customer.setOutstandingBalance(newBalance);
        updateById(customer);
    }

    private CustomerVO toVO(Customer customer) {
        CustomerVO vo = new CustomerVO();
        BeanUtils.copyProperties(customer, vo);
        return vo;
    }
}
