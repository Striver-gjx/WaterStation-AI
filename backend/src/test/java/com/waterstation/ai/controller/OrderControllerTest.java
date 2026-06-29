package com.waterstation.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterstation.ai.common.exception.GlobalExceptionHandler;
import com.waterstation.ai.common.result.PageResult;
import com.waterstation.ai.dto.OrderCreateDTO;
import com.waterstation.ai.service.OrderService;
import com.waterstation.ai.vo.OrderVO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("订单API接口测试")
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @Test
    @DisplayName("GET /api/v1/orders - 分页查询订单列表")
    void listOrders_returnsPageResult() throws Exception {
        OrderVO vo = new OrderVO();
        vo.setId(1L);
        vo.setOrderNo("WS20260629001");
        vo.setStatus("PENDING_PAYMENT");
        vo.setTotalAmount(new BigDecimal("45.00"));

        when(orderService.listOrders(eq(1), eq(20), isNull(), isNull(), isNull()))
                .thenReturn(PageResult.of(1L, List.of(vo)));

        mockMvc.perform(get("/api/v1/orders")
                        .param("page", "1")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.list[0].orderNo").value("WS20260629001"));
    }

    @Test
    @DisplayName("GET /api/v1/orders/{id} - 查询单个订单")
    void getOrder_existingId_returnsOrder() throws Exception {
        OrderVO vo = new OrderVO();
        vo.setId(1L);
        vo.setOrderNo("WS001");
        vo.setCustomerName("张三");

        when(orderService.getOrderById(1L)).thenReturn(vo);

        mockMvc.perform(get("/api/v1/orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderNo").value("WS001"))
                .andExpect(jsonPath("$.data.customerName").value("张三"));
    }

    @Test
    @DisplayName("POST /api/v1/orders - 创建订单成功")
    void createOrder_validData_returns200() throws Exception {
        OrderCreateDTO dto = new OrderCreateDTO();
        dto.setCustomerId(1L);
        dto.setDeliveryAddress("测试地址");
        OrderCreateDTO.OrderItemDTO item = new OrderCreateDTO.OrderItemDTO();
        item.setProductId(1L);
        item.setQuantity(2);
        dto.setItems(List.of(item));

        OrderVO resultVO = new OrderVO();
        resultVO.setId(1L);
        resultVO.setOrderNo("WS20260629001");

        when(orderService.createOrder(any())).thenReturn(resultVO);

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderNo").value("WS20260629001"));
    }

    @Test
    @DisplayName("POST /api/v1/orders - 缺少客户ID返回400")
    void createOrder_missingCustomerId_returnsBadRequest() throws Exception {
        OrderCreateDTO dto = new OrderCreateDTO();
        dto.setDeliveryAddress("测试地址");
        OrderCreateDTO.OrderItemDTO item = new OrderCreateDTO.OrderItemDTO();
        item.setProductId(1L);
        item.setQuantity(2);
        dto.setItems(List.of(item));

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/orders - 空订单明细返回400")
    void createOrder_emptyItems_returnsBadRequest() throws Exception {
        OrderCreateDTO dto = new OrderCreateDTO();
        dto.setCustomerId(1L);
        dto.setDeliveryAddress("测试地址");
        dto.setItems(List.of());

        mockMvc.perform(post("/api/v1/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/v1/orders/{id} - 删除订单")
    void deleteOrder_returns200() throws Exception {
        mockMvc.perform(delete("/api/v1/orders/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(orderService).deleteOrder(1L);
    }
}
