package com.waterstation.ai.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.waterstation.ai.dto.DriverCreateDTO;
import com.waterstation.ai.dto.DriverUpdateDTO;
import com.waterstation.ai.entity.Driver;
import com.waterstation.ai.vo.DriverVO;
import java.math.BigDecimal;
import java.util.List;

public interface DriverService extends IService<Driver> {
    List<DriverVO> listDrivers(String status);
    DriverVO getDriverById(Long id);
    DriverVO createDriver(DriverCreateDTO dto);
    void updateDriver(Long id, DriverUpdateDTO dto);
    void updateDriverStatus(Long id, String status);
    void updateDriverLocation(Long id, BigDecimal latitude, BigDecimal longitude);
}
