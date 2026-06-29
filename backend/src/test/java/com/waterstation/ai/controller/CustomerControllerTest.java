package com.waterstation.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterstation.ai.common.exception.GlobalExceptionHandler;
import com.waterstation.ai.common.result.PageResult;
import com.waterstation.ai.dto.CustomerCreateDTO;
import com.waterstation.ai.service.CustomerService;
import com.waterstation.ai.vo.CustomerVO;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CustomerController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("客户API接口测试")
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CustomerService customerService;

    @Test
    @DisplayName("GET /api/v1/customers - 分页查询客户列表")
    void listCustomers_returnsPageResult() throws Exception {
        CustomerVO vo = new CustomerVO();
        vo.setId(1L);
        vo.setName("张三");
        vo.setPhone("13800138000");

        PageResult<CustomerVO> pageResult = PageResult.of(1L, List.of(vo));
        when(customerService.listCustomers(eq(1), eq(20), isNull(), isNull()))
                .thenReturn(pageResult);

        mockMvc.perform(get("/api/v1/customers")
                        .param("page", "1")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.list[0].name").value("张三"));
    }

    @Test
    @DisplayName("GET /api/v1/customers/{id} - 查询单个客户")
    void getCustomer_existingId_returnsCustomer() throws Exception {
        CustomerVO vo = new CustomerVO();
        vo.setId(1L);
        vo.setName("李四");
        vo.setPhone("13900139000");
        vo.setAddress("上海市浦东新区");

        when(customerService.getCustomerById(1L)).thenReturn(vo);

        mockMvc.perform(get("/api/v1/customers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.name").value("李四"))
                .andExpect(jsonPath("$.data.address").value("上海市浦东新区"));
    }

    @Test
    @DisplayName("POST /api/v1/customers - 创建客户成功")
    void createCustomer_validData_returns200() throws Exception {
        CustomerCreateDTO dto = new CustomerCreateDTO();
        dto.setName("王五");
        dto.setPhone("13700137000");
        dto.setAddress("广州市天河区");

        CustomerVO resultVO = new CustomerVO();
        resultVO.setId(3L);
        resultVO.setName("王五");
        resultVO.setPhone("13700137000");

        when(customerService.createCustomer(any(CustomerCreateDTO.class))).thenReturn(resultVO);

        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.id").value(3))
                .andExpect(jsonPath("$.data.name").value("王五"));
    }

    @Test
    @DisplayName("POST /api/v1/customers - 缺少必填字段返回校验错误")
    void createCustomer_missingName_returnsBadRequest() throws Exception {
        CustomerCreateDTO dto = new CustomerCreateDTO();
        dto.setPhone("13700137000");
        dto.setAddress("广州市");

        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/customers - 手机号格式错误返回校验错误")
    void createCustomer_invalidPhone_returnsBadRequest() throws Exception {
        CustomerCreateDTO dto = new CustomerCreateDTO();
        dto.setName("赵六");
        dto.setPhone("123");
        dto.setAddress("深圳市");

        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/v1/customers/{id} - 删除客户")
    void deleteCustomer_existingId_returns200() throws Exception {
        mockMvc.perform(delete("/api/v1/customers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("POST /api/v1/customers/{id}/payment - 记录还款")
    void recordPayment_validAmount_returns200() throws Exception {
        mockMvc.perform(post("/api/v1/customers/1/payment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\": 50.00}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }
}
