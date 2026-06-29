package com.waterstation.ai.service;

import com.waterstation.ai.common.exception.BusinessException;
import com.waterstation.ai.dto.DriverCreateDTO;
import com.waterstation.ai.dto.DriverUpdateDTO;
import com.waterstation.ai.vo.DriverVO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
@DisplayName("配送员服务层集成测试")
class DriverServiceTest {

    @Autowired
    private DriverService driverService;

    private DriverCreateDTO buildCreateDTO(String name, String phone) {
        DriverCreateDTO dto = new DriverCreateDTO();
        dto.setName(name);
        dto.setPhone(phone);
        dto.setVehicleType("电动三轮车");
        dto.setServiceArea("朝阳区");
        return dto;
    }

    @Test
    @DisplayName("创建配送员 - 设置默认值")
    void createDriver_validData_setsDefaults() {
        DriverVO result = driverService.createDriver(buildCreateDTO("张师傅", "13800001111"));

        assertThat(result).isNotNull();
        assertThat(result.getId()).isNotNull();
        assertThat(result.getName()).isEqualTo("张师傅");
        assertThat(result.getStatus()).isEqualTo("OFFLINE");
        assertThat(result.getTotalDeliveries()).isEqualTo(0);
        assertThat(result.getRating()).isEqualByComparingTo(new BigDecimal("5.00"));
        assertThat(result.getMaxDailyOrders()).isEqualTo(50);
    }

    @Test
    @DisplayName("创建配送员 - 自定义最大接单量")
    void createDriver_customMaxOrders_usesProvided() {
        DriverCreateDTO dto = buildCreateDTO("李师傅", "13800002222");
        dto.setMaxDailyOrders(30);

        DriverVO result = driverService.createDriver(dto);

        assertThat(result.getMaxDailyOrders()).isEqualTo(30);
    }

    @Test
    @DisplayName("创建配送员 - 手机号重复抛出异常")
    void createDriver_duplicatePhone_throwsException() {
        driverService.createDriver(buildCreateDTO("王师傅A", "13800003333"));

        assertThatThrownBy(() -> driverService.createDriver(buildCreateDTO("王师傅B", "13800003333")))
                .isInstanceOf(BusinessException.class)
                .hasMessage("该手机号已注册为配送员");
    }

    @Test
    @DisplayName("根据ID查询 - 存在时返回VO")
    void getDriverById_existing_returnsVO() {
        DriverVO created = driverService.createDriver(buildCreateDTO("赵师傅", "13800004444"));

        DriverVO found = driverService.getDriverById(created.getId());

        assertThat(found.getName()).isEqualTo("赵师傅");
        assertThat(found.getPhone()).isEqualTo("13800004444");
    }

    @Test
    @DisplayName("根据ID查询 - 不存在时抛出异常")
    void getDriverById_nonExisting_throwsException() {
        assertThatThrownBy(() -> driverService.getDriverById(99999L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("配送员不存在");
    }

    @Test
    @DisplayName("更新配送员 - 部分更新")
    void updateDriver_partialUpdate_onlyChangesProvided() {
        DriverVO created = driverService.createDriver(buildCreateDTO("孙师傅", "13800005555"));

        DriverUpdateDTO updateDTO = new DriverUpdateDTO();
        updateDTO.setName("孙大师傅");
        updateDTO.setMaxDailyOrders(80);

        driverService.updateDriver(created.getId(), updateDTO);

        DriverVO updated = driverService.getDriverById(created.getId());
        assertThat(updated.getName()).isEqualTo("孙大师傅");
        assertThat(updated.getMaxDailyOrders()).isEqualTo(80);
        assertThat(updated.getPhone()).isEqualTo("13800005555");
    }

    @Test
    @DisplayName("更新配送员 - 不存在时抛出异常")
    void updateDriver_nonExisting_throwsException() {
        DriverUpdateDTO dto = new DriverUpdateDTO();
        dto.setName("不存在");

        assertThatThrownBy(() -> driverService.updateDriver(99999L, dto))
                .isInstanceOf(BusinessException.class)
                .hasMessage("配送员不存在");
    }

    @Test
    @DisplayName("更新状态 - ONLINE/OFFLINE 切换")
    void updateDriverStatus_toggle_changesStatus() {
        DriverVO created = driverService.createDriver(buildCreateDTO("周师傅", "13800006666"));
        assertThat(created.getStatus()).isEqualTo("OFFLINE");

        driverService.updateDriverStatus(created.getId(), "ONLINE");
        DriverVO online = driverService.getDriverById(created.getId());
        assertThat(online.getStatus()).isEqualTo("ONLINE");

        driverService.updateDriverStatus(created.getId(), "OFFLINE");
        DriverVO offline = driverService.getDriverById(created.getId());
        assertThat(offline.getStatus()).isEqualTo("OFFLINE");
    }

    @Test
    @DisplayName("更新状态 - 不存在时抛出异常")
    void updateDriverStatus_nonExisting_throwsException() {
        assertThatThrownBy(() -> driverService.updateDriverStatus(99999L, "ONLINE"))
                .isInstanceOf(BusinessException.class)
                .hasMessage("配送员不存在");
    }

    @Test
    @DisplayName("更新位置 - 正常更新经纬度")
    void updateDriverLocation_validData_updatesCoordinates() {
        DriverVO created = driverService.createDriver(buildCreateDTO("钱师傅", "13800007777"));

        driverService.updateDriverLocation(created.getId(),
                new BigDecimal("39.908823"), new BigDecimal("116.397470"));

        DriverVO updated = driverService.getDriverById(created.getId());
        assertThat(updated.getCurrentLatitude()).isEqualByComparingTo(new BigDecimal("39.908823"));
        assertThat(updated.getCurrentLongitude()).isEqualByComparingTo(new BigDecimal("116.397470"));
    }

    @Test
    @DisplayName("更新位置 - 不存在时抛出异常")
    void updateDriverLocation_nonExisting_throwsException() {
        assertThatThrownBy(() -> driverService.updateDriverLocation(99999L,
                new BigDecimal("39.9"), new BigDecimal("116.3")))
                .isInstanceOf(BusinessException.class)
                .hasMessage("配送员不存在");
    }

    @Test
    @DisplayName("列表查询 - 按状态筛选")
    void listDrivers_filterByStatus_returnsMatching() {
        driverService.createDriver(buildCreateDTO("配送员A", "13800008881"));
        DriverVO driverB = driverService.createDriver(buildCreateDTO("配送员B", "13800008882"));
        driverService.updateDriverStatus(driverB.getId(), "ONLINE");

        List<DriverVO> online = driverService.listDrivers("ONLINE");
        assertThat(online).extracting("name").contains("配送员B");

        List<DriverVO> offline = driverService.listDrivers("OFFLINE");
        assertThat(offline).extracting("name").contains("配送员A");
    }

    @Test
    @DisplayName("列表查询 - 无筛选返回所有")
    void listDrivers_noFilter_returnsAll() {
        driverService.createDriver(buildCreateDTO("全部A", "13800009991"));
        driverService.createDriver(buildCreateDTO("全部B", "13800009992"));

        List<DriverVO> all = driverService.listDrivers(null);
        assertThat(all.size()).isGreaterThanOrEqualTo(2);
    }
}
