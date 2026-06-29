package com.waterstation.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("安全测试 - 注入/越权/异常输入")
class SecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("SQL注入 - 客户搜索关键字含SQL语句应安全返回")
    void sqlInjection_customerSearch_safeReturn() throws Exception {
        mockMvc.perform(get("/api/v1/customers")
                        .param("keyword", "'; DROP TABLE customer; --"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("SQL注入 - tier参数含SQL注入应安全返回")
    void sqlInjection_tierParam_safeReturn() throws Exception {
        mockMvc.perform(get("/api/v1/customers")
                        .param("tier", "REGULAR' OR '1'='1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("SQL注入 - 订单状态参数含SQL注入应安全返回")
    void sqlInjection_orderStatus_safeReturn() throws Exception {
        mockMvc.perform(get("/api/v1/orders")
                        .param("status", "PENDING'; DELETE FROM `order` WHERE '1'='1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("XSS - 客户名称含脚本标签应正常存储不执行")
    void xss_customerName_storedSafely() throws Exception {
        String payload = "{\"name\":\"<script>alert('xss')</script>\",\"phone\":\"13100009999\",\"address\":\"test\"}";

        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.name").value("<script>alert('xss')</script>"));
    }

    @Test
    @DisplayName("越权 - 访问不存在的客户ID应返回业务异常")
    void unauthorized_nonExistingCustomer_returnsBusinessError() throws Exception {
        mockMvc.perform(get("/api/v1/customers/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("客户不存在"));
    }

    @Test
    @DisplayName("越权 - 删除不存在的订单应返回业务异常")
    void unauthorized_deleteNonExistingOrder_returnsBusinessError() throws Exception {
        mockMvc.perform(delete("/api/v1/orders/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("订单不存在"));
    }

    @Test
    @DisplayName("异常输入 - 超长字符串客户名称应返回服务器错误（数据库列限制）")
    void abnormalInput_extremelyLongName_returnsError() throws Exception {
        String longName = "A".repeat(10000);
        String payload = String.format(
                "{\"name\":\"%s\",\"phone\":\"13100001111\",\"address\":\"test\"}", longName);

        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("异常输入 - 负数页码应安全返回")
    void abnormalInput_negativePage_safeReturn() throws Exception {
        mockMvc.perform(get("/api/v1/customers")
                        .param("page", "-1")
                        .param("size", "20"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("异常输入 - 超大页码应返回空列表")
    void abnormalInput_hugePage_returnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/v1/customers")
                        .param("page", "999999")
                        .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    @DisplayName("异常输入 - 非法JSON格式应返回服务器错误")
    void abnormalInput_invalidJson_returnsError() throws Exception {
        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("这不是JSON{"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @DisplayName("异常输入 - 空请求体应返回校验错误")
    void abnormalInput_emptyBody_returnsValidationError() throws Exception {
        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("异常输入 - 还款金额为极大数值应正常处理")
    void abnormalInput_hugePaymentAmount_handledGracefully() throws Exception {
        String payload = "{\"name\":\"安全测试\",\"phone\":\"13100002222\",\"address\":\"test\"}";
        var createResult = mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = createResult.getResponse().getContentAsString();
        Long customerId = objectMapper.readTree(responseBody).get("data").get("id").asLong();

        mockMvc.perform(post("/api/v1/customers/" + customerId + "/payment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\": 99999999999.99}"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("路径遍历 - 带特殊字符的路径参数应返回错误（不泄露系统信息）")
    void pathTraversal_specialCharsInPath_returnsError() throws Exception {
        var result = mockMvc.perform(get("/api/v1/data/backup/../../../etc/passwd"))
                .andReturn();

        // Should not return actual file contents - either 200 with empty data or error
        String content = result.getResponse().getContentAsString();
        org.assertj.core.api.Assertions.assertThat(content).doesNotContain("root:");
    }

    @Test
    @DisplayName("异常输入 - 产品库存调整为负数应返回业务异常")
    void abnormalInput_negativeStockQuantity_rejected() throws Exception {
        mockMvc.perform(put("/api/v1/products/1/stock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"changeType\":\"IN\",\"quantity\":-100}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }
}
