package com.waterstation.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterstation.ai.common.exception.GlobalExceptionHandler;
import com.waterstation.ai.dto.DeliveryCompleteDTO;
import com.waterstation.ai.service.DeliveryService;
import com.waterstation.ai.vo.DeliveryVO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DeliveryController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("配送API接口测试")
class DeliveryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DeliveryService deliveryService;

    @Test
    @DisplayName("GET /api/v1/deliveries/{id} - 查询配送详情")
    void getDelivery_existingId_returnsDelivery() throws Exception {
        DeliveryVO vo = new DeliveryVO();
        vo.setId(1L);
        vo.setStatus("IN_TRANSIT");

        when(deliveryService.getDeliveryById(1L)).thenReturn(vo);

        mockMvc.perform(get("/api/v1/deliveries/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.status").value("IN_TRANSIT"));
    }

    @Test
    @DisplayName("POST /api/v1/deliveries/{id}/pickup - 取件")
    void pickup_returns200() throws Exception {
        mockMvc.perform(post("/api/v1/deliveries/1/pickup"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(deliveryService).pickupDelivery(1L);
    }

    @Test
    @DisplayName("POST /api/v1/deliveries/{id}/complete - 完成配送")
    void complete_validData_returns200() throws Exception {
        DeliveryCompleteDTO dto = new DeliveryCompleteDTO();
        dto.setGpsLatitude(new BigDecimal("39.9042"));
        dto.setGpsLongitude(new BigDecimal("116.4074"));
        dto.setEmptyBucketsCollected(2);
        dto.setCustomerSigned(true);

        mockMvc.perform(post("/api/v1/deliveries/1/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(deliveryService).completeDelivery(eq(1L), any());
    }

    @Test
    @DisplayName("POST /api/v1/deliveries/{id}/complete - 缺少GPS信息返回400")
    void complete_missingGps_returnsBadRequest() throws Exception {
        DeliveryCompleteDTO dto = new DeliveryCompleteDTO();
        dto.setEmptyBucketsCollected(2);
        dto.setCustomerSigned(true);

        mockMvc.perform(post("/api/v1/deliveries/1/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/deliveries/{id}/complete - 缺少签收状态返回400")
    void complete_missingSignedStatus_returnsBadRequest() throws Exception {
        DeliveryCompleteDTO dto = new DeliveryCompleteDTO();
        dto.setGpsLatitude(new BigDecimal("39.9042"));
        dto.setGpsLongitude(new BigDecimal("116.4074"));
        dto.setEmptyBucketsCollected(2);

        mockMvc.perform(post("/api/v1/deliveries/1/complete")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }
}
