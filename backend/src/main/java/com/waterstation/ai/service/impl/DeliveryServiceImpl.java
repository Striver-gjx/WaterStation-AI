package com.waterstation.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.waterstation.ai.common.exception.BusinessException;
import com.waterstation.ai.dto.DeliveryCompleteDTO;
import com.waterstation.ai.entity.Delivery;
import com.waterstation.ai.entity.Driver;
import com.waterstation.ai.entity.Order;
import com.waterstation.ai.mapper.DeliveryMapper;
import com.waterstation.ai.mapper.DriverMapper;
import com.waterstation.ai.mapper.OrderMapper;
import com.waterstation.ai.service.DeliveryService;
import com.waterstation.ai.vo.DeliveryVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl extends ServiceImpl<DeliveryMapper, Delivery> implements DeliveryService {

    private final DriverMapper driverMapper;
    private final OrderMapper orderMapper;

    @Override
    public DeliveryVO getDeliveryById(Long id) {
        Delivery delivery = getById(id);
        if (delivery == null) {
            throw new BusinessException("配送记录不存在");
        }
        return toVO(delivery);
    }

    @Override
    public DeliveryVO getByOrderId(Long orderId) {
        Delivery delivery = getOne(new LambdaQueryWrapper<Delivery>().eq(Delivery::getOrderId, orderId));
        if (delivery == null) {
            throw new BusinessException("该订单无配送记录");
        }
        return toVO(delivery);
    }

    @Override
    public void pickupDelivery(Long id) {
        Delivery delivery = getById(id);
        if (delivery == null) {
            throw new BusinessException("配送记录不存在");
        }
        if (!"PENDING".equals(delivery.getStatus())) {
            throw new BusinessException("当前状态不允许取货");
        }
        delivery.setStatus("PICKED_UP");
        delivery.setPickupTime(LocalDateTime.now());
        updateById(delivery);
    }

    @Override
    @Transactional
    public void completeDelivery(Long id, DeliveryCompleteDTO dto) {
        Delivery delivery = getById(id);
        if (delivery == null) {
            throw new BusinessException("配送记录不存在");
        }

        delivery.setStatus("DELIVERED");
        delivery.setDeliveredTime(LocalDateTime.now());
        delivery.setDeliveryPhotoUrl(dto.getDeliveryPhotoUrl());
        delivery.setSignPhotoUrl(dto.getSignPhotoUrl());
        delivery.setGpsLatitude(dto.getGpsLatitude());
        delivery.setGpsLongitude(dto.getGpsLongitude());
        delivery.setEmptyBucketsCollected(dto.getEmptyBucketsCollected());
        delivery.setCustomerSigned(dto.getCustomerSigned() ? 1 : 0);
        delivery.setRemark(dto.getRemark());
        updateById(delivery);

        Driver driver = driverMapper.selectById(delivery.getDriverId());
        if (driver != null) {
            driver.setTotalDeliveries(driver.getTotalDeliveries() + 1);
            driverMapper.updateById(driver);
        }

        Order order = orderMapper.selectById(delivery.getOrderId());
        if (order != null) {
            order.setStatus("DELIVERED");
            orderMapper.updateById(order);
        }
    }

    private DeliveryVO toVO(Delivery delivery) {
        DeliveryVO vo = new DeliveryVO();
        BeanUtils.copyProperties(delivery, vo);
        vo.setCustomerSigned(delivery.getCustomerSigned() != null && delivery.getCustomerSigned() == 1);
        Driver driver = driverMapper.selectById(delivery.getDriverId());
        if (driver != null) {
            vo.setDriverName(driver.getName());
        }
        return vo;
    }
}
