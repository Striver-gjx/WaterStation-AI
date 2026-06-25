package com.waterstation.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.waterstation.ai.common.exception.BusinessException;
import com.waterstation.ai.entity.Bucket;
import com.waterstation.ai.entity.Customer;
import com.waterstation.ai.mapper.BucketMapper;
import com.waterstation.ai.mapper.CustomerMapper;
import com.waterstation.ai.service.BucketService;
import com.waterstation.ai.vo.BucketVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BucketServiceImpl extends ServiceImpl<BucketMapper, Bucket> implements BucketService {

    private final CustomerMapper customerMapper;

    @Override
    public List<BucketVO> listBuckets(Long customerId, String status) {
        LambdaQueryWrapper<Bucket> wrapper = new LambdaQueryWrapper<>();
        if (customerId != null) {
            wrapper.eq(Bucket::getCustomerId, customerId);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(Bucket::getStatus, status);
        }
        wrapper.orderByDesc(Bucket::getCreatedAt);
        return list(wrapper).stream().map(this::toVO).toList();
    }

    @Override
    public void issueBucket(Long customerId, String bucketType, BigDecimal depositAmount) {
        Customer customer = customerMapper.selectById(customerId);
        if (customer == null) {
            throw new BusinessException("客户不存在");
        }

        Bucket bucket = new Bucket();
        bucket.setCustomerId(customerId);
        bucket.setBucketType(bucketType != null ? bucketType : "STANDARD_20L");
        bucket.setDepositAmount(depositAmount != null ? depositAmount : new BigDecimal("50.00"));
        bucket.setStatus("WITH_CUSTOMER");
        bucket.setIssuedDate(LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
        save(bucket);
    }

    @Override
    public void returnBucket(Long id) {
        Bucket bucket = getById(id);
        if (bucket == null) {
            throw new BusinessException("桶记录不存在");
        }
        if (!"WITH_CUSTOMER".equals(bucket.getStatus())) {
            throw new BusinessException("该桶不在客户手中，无法退还");
        }
        bucket.setStatus("RETURNED");
        bucket.setReturnedDate(LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));
        updateById(bucket);
    }

    private BucketVO toVO(Bucket bucket) {
        BucketVO vo = new BucketVO();
        vo.setId(bucket.getId());
        vo.setCustomerId(bucket.getCustomerId());
        vo.setBucketType(bucket.getBucketType());
        vo.setDepositAmount(bucket.getDepositAmount());
        vo.setStatus(bucket.getStatus());
        vo.setIssuedDate(bucket.getIssuedDate());
        vo.setReturnedDate(bucket.getReturnedDate());
        Customer customer = customerMapper.selectById(bucket.getCustomerId());
        if (customer != null) {
            vo.setCustomerName(customer.getName());
        }
        return vo;
    }
}
