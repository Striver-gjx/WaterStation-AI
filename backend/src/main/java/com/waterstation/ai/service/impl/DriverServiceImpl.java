package com.waterstation.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.waterstation.ai.common.exception.BusinessException;
import com.waterstation.ai.dto.DriverCreateDTO;
import com.waterstation.ai.dto.DriverUpdateDTO;
import com.waterstation.ai.entity.Driver;
import com.waterstation.ai.mapper.DriverMapper;
import com.waterstation.ai.service.DriverService;
import com.waterstation.ai.vo.DriverVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverServiceImpl extends ServiceImpl<DriverMapper, Driver> implements DriverService {

    @Override
    public List<DriverVO> listDrivers(String status) {
        LambdaQueryWrapper<Driver> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(status)) {
            wrapper.eq(Driver::getStatus, status);
        }
        wrapper.orderByDesc(Driver::getRating);
        return list(wrapper).stream().map(this::toVO).toList();
    }

    @Override
    public DriverVO getDriverById(Long id) {
        Driver driver = getById(id);
        if (driver == null) {
            throw new BusinessException("配送员不存在");
        }
        return toVO(driver);
    }

    @Override
    public DriverVO createDriver(DriverCreateDTO dto) {
        long count = count(new LambdaQueryWrapper<Driver>().eq(Driver::getPhone, dto.getPhone()));
        if (count > 0) {
            throw new BusinessException("该手机号已注册为配送员");
        }

        Driver driver = new Driver();
        BeanUtils.copyProperties(dto, driver);
        if (driver.getMaxDailyOrders() == null) driver.setMaxDailyOrders(50);
        driver.setStatus("OFFLINE");
        driver.setTotalDeliveries(0);
        driver.setRating(new BigDecimal("5.00"));
        save(driver);
        return toVO(driver);
    }

    @Override
    public void updateDriver(Long id, DriverUpdateDTO dto) {
        Driver driver = getById(id);
        if (driver == null) {
            throw new BusinessException("配送员不存在");
        }
        if (StringUtils.hasText(dto.getName())) driver.setName(dto.getName());
        if (StringUtils.hasText(dto.getPhone())) driver.setPhone(dto.getPhone());
        if (dto.getVehicleType() != null) driver.setVehicleType(dto.getVehicleType());
        if (dto.getVehiclePlate() != null) driver.setVehiclePlate(dto.getVehiclePlate());
        if (dto.getServiceArea() != null) driver.setServiceArea(dto.getServiceArea());
        if (dto.getMaxDailyOrders() != null) driver.setMaxDailyOrders(dto.getMaxDailyOrders());
        updateById(driver);
    }

    @Override
    public void updateDriverStatus(Long id, String status) {
        Driver driver = getById(id);
        if (driver == null) {
            throw new BusinessException("配送员不存在");
        }
        driver.setStatus(status);
        updateById(driver);
    }

    @Override
    public void updateDriverLocation(Long id, BigDecimal latitude, BigDecimal longitude) {
        Driver driver = getById(id);
        if (driver == null) {
            throw new BusinessException("配送员不存在");
        }
        driver.setCurrentLatitude(latitude);
        driver.setCurrentLongitude(longitude);
        updateById(driver);
    }

    private DriverVO toVO(Driver driver) {
        DriverVO vo = new DriverVO();
        BeanUtils.copyProperties(driver, vo);
        return vo;
    }
}
