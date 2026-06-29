package com.waterstation.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterstation.ai.common.exception.GlobalExceptionHandler;
import com.waterstation.ai.dto.DriverCreateDTO;
import com.waterstation.ai.service.DriverService;
import com.waterstation.ai.vo.DriverVO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DriverController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("配送员API接口测试")
class DriverControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DriverService driverService;

    @Test
    @DisplayName("GET /api/v1/drivers - 获取配送员列表")
    void listDrivers_returnsListResult() throws Exception {
        DriverVO vo = new DriverVO();
        vo.setId(1L);
        vo.setName("王师傅");
        vo.setStatus("ACTIVE");

        when(driverService.listDrivers(isNull())).thenReturn(List.of(vo));

        mockMvc.perform(get("/api/v1/drivers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].name").value("王师傅"));
    }

    @Test
    @DisplayName("GET /api/v1/drivers/{id} - 查询单个配送员")
    void getDriver_existingId_returnsDriver() throws Exception {
        DriverVO vo = new DriverVO();
        vo.setId(1L);
        vo.setName("李师傅");
        vo.setPhone("13900001111");

        when(driverService.getDriverById(1L)).thenReturn(vo);

        mockMvc.perform(get("/api/v1/drivers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("李师傅"))
                .andExpect(jsonPath("$.data.phone").value("13900001111"));
    }

    @Test
    @DisplayName("POST /api/v1/drivers - 创建配送员成功")
    void createDriver_validData_returns200() throws Exception {
        DriverCreateDTO dto = new DriverCreateDTO();
        dto.setName("新配送员");
        dto.setPhone("13800001234");

        DriverVO resultVO = new DriverVO();
        resultVO.setId(3L);
        resultVO.setName("新配送员");

        when(driverService.createDriver(any())).thenReturn(resultVO);

        mockMvc.perform(post("/api/v1/drivers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(3))
                .andExpect(jsonPath("$.data.name").value("新配送员"));
    }

    @Test
    @DisplayName("POST /api/v1/drivers - 缺少姓名返回400")
    void createDriver_missingName_returnsBadRequest() throws Exception {
        DriverCreateDTO dto = new DriverCreateDTO();
        dto.setPhone("13800001234");

        mockMvc.perform(post("/api/v1/drivers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/drivers - 缺少手机号返回400")
    void createDriver_missingPhone_returnsBadRequest() throws Exception {
        DriverCreateDTO dto = new DriverCreateDTO();
        dto.setName("有名无号");

        mockMvc.perform(post("/api/v1/drivers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/v1/drivers/{id}/status - 更新状态")
    void updateStatus_returns200() throws Exception {
        mockMvc.perform(put("/api/v1/drivers/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"OFFLINE\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(driverService).updateDriverStatus(1L, "OFFLINE");
    }

    @Test
    @DisplayName("PUT /api/v1/drivers/{id}/location - 更新位置")
    void updateLocation_returns200() throws Exception {
        mockMvc.perform(put("/api/v1/drivers/1/location")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"latitude\":39.9042,\"longitude\":116.4074}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(driverService).updateDriverLocation(eq(1L), any(), any());
    }
}
