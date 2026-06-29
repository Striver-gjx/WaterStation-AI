package com.waterstation.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterstation.ai.common.exception.GlobalExceptionHandler;
import com.waterstation.ai.dto.ProductCreateDTO;
import com.waterstation.ai.service.ProductService;
import com.waterstation.ai.vo.ProductVO;
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

@WebMvcTest(ProductController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("产品API接口测试")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @Test
    @DisplayName("GET /api/v1/products - 获取产品列表")
    void listProducts_returnsListResult() throws Exception {
        ProductVO vo = new ProductVO();
        vo.setId(1L);
        vo.setName("大桶纯净水");
        vo.setUnitPrice(new BigDecimal("15.00"));

        when(productService.listProducts(isNull(), isNull())).thenReturn(List.of(vo));

        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data[0].name").value("大桶纯净水"));
    }

    @Test
    @DisplayName("GET /api/v1/products/{id} - 查询单个产品")
    void getProduct_existingId_returnsProduct() throws Exception {
        ProductVO vo = new ProductVO();
        vo.setId(1L);
        vo.setName("矿泉水");
        vo.setStock(100);

        when(productService.getProductById(1L)).thenReturn(vo);

        mockMvc.perform(get("/api/v1/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("矿泉水"))
                .andExpect(jsonPath("$.data.stock").value(100));
    }

    @Test
    @DisplayName("POST /api/v1/products - 创建产品成功")
    void createProduct_validData_returns200() throws Exception {
        ProductCreateDTO dto = new ProductCreateDTO();
        dto.setName("新产品");
        dto.setUnitPrice(new BigDecimal("20.00"));

        ProductVO resultVO = new ProductVO();
        resultVO.setId(5L);
        resultVO.setName("新产品");

        when(productService.createProduct(any())).thenReturn(resultVO);

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(5))
                .andExpect(jsonPath("$.data.name").value("新产品"));
    }

    @Test
    @DisplayName("POST /api/v1/products - 缺少名称返回400")
    void createProduct_missingName_returnsBadRequest() throws Exception {
        ProductCreateDTO dto = new ProductCreateDTO();
        dto.setUnitPrice(new BigDecimal("10.00"));

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/products - 缺少单价返回400")
    void createProduct_missingPrice_returnsBadRequest() throws Exception {
        ProductCreateDTO dto = new ProductCreateDTO();
        dto.setName("有名字无价格");

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("DELETE /api/v1/products/{id} - 删除产品")
    void deleteProduct_returns200() throws Exception {
        mockMvc.perform(delete("/api/v1/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @DisplayName("PUT /api/v1/products/{id}/stock - 调整库存")
    void adjustStock_validData_returns200() throws Exception {
        mockMvc.perform(put("/api/v1/products/1/stock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"changeType\":\"IN\",\"quantity\":50,\"remark\":\"补货\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(productService).adjustStock(1L, "IN", 50, "补货");
    }
}
