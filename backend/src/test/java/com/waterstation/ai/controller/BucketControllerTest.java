package com.waterstation.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterstation.ai.common.exception.GlobalExceptionHandler;
import com.waterstation.ai.service.BucketService;
import com.waterstation.ai.vo.BucketVO;
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

@WebMvcTest(BucketController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("桶管理API接口测试")
class BucketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BucketService bucketService;

    @Test
    @DisplayName("GET /api/v1/tickets/buckets - 获取桶列表")
    void listBuckets_returnsListResult() throws Exception {
        BucketVO vo = new BucketVO();
        vo.setId(1L);
        vo.setStatus("ISSUED");

        when(bucketService.listBuckets(isNull(), isNull())).thenReturn(List.of(vo));

        mockMvc.perform(get("/api/v1/tickets/buckets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].status").value("ISSUED"));
    }

    @Test
    @DisplayName("GET /api/v1/tickets/buckets?customerId=1 - 按客户筛选")
    void listBuckets_byCustomer_callsServiceWithParam() throws Exception {
        when(bucketService.listBuckets(eq(1L), isNull())).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/tickets/buckets").param("customerId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(bucketService).listBuckets(1L, null);
    }

    @Test
    @DisplayName("POST /api/v1/tickets/buckets/issue - 发桶")
    void issueBucket_validData_returns200() throws Exception {
        mockMvc.perform(post("/api/v1/tickets/buckets/issue")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerId\":1,\"bucketType\":\"20L\",\"depositAmount\":30}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(bucketService).issueBucket(eq(1L), eq("20L"), any());
    }

    @Test
    @DisplayName("POST /api/v1/tickets/buckets/{id}/return - 收桶")
    void returnBucket_returns200() throws Exception {
        mockMvc.perform(post("/api/v1/tickets/buckets/1/return"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(bucketService).returnBucket(1L);
    }
}
