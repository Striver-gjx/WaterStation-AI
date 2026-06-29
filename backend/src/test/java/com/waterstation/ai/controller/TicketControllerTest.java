package com.waterstation.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterstation.ai.common.exception.GlobalExceptionHandler;
import com.waterstation.ai.common.result.PageResult;
import com.waterstation.ai.dto.TicketRedeemDTO;
import com.waterstation.ai.dto.TicketSellDTO;
import com.waterstation.ai.service.TicketService;
import com.waterstation.ai.vo.TicketPackageVO;
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

@WebMvcTest(TicketController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("水票API接口测试")
class TicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TicketService ticketService;

    @Test
    @DisplayName("GET /api/v1/tickets/packages - 分页查询水票套餐")
    void listPackages_returnsPageResult() throws Exception {
        TicketPackageVO vo = new TicketPackageVO();
        vo.setId(1L);
        vo.setTotalTickets(20);
        vo.setRemainingTickets(15);
        vo.setStatus("ACTIVE");

        when(ticketService.listPackages(isNull(), isNull(), eq(1), eq(20)))
                .thenReturn(PageResult.of(1L, List.of(vo)));

        mockMvc.perform(get("/api/v1/tickets/packages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.list[0].remainingTickets").value(15));
    }

    @Test
    @DisplayName("GET /api/v1/tickets/packages/{id} - 查询单个套餐")
    void getPackage_existingId_returnsPackage() throws Exception {
        TicketPackageVO vo = new TicketPackageVO();
        vo.setId(1L);
        vo.setCustomerName("测试客户");
        vo.setTotalTickets(10);

        when(ticketService.getPackageById(1L)).thenReturn(vo);

        mockMvc.perform(get("/api/v1/tickets/packages/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.customerName").value("测试客户"))
                .andExpect(jsonPath("$.data.totalTickets").value(10));
    }

    @Test
    @DisplayName("POST /api/v1/tickets/packages - 售出水票成功")
    void sellPackage_validData_returns200() throws Exception {
        TicketSellDTO dto = new TicketSellDTO();
        dto.setCustomerId(1L);
        dto.setProductId(1L);
        dto.setTotalTickets(20);
        dto.setPricePaid(new BigDecimal("300.00"));

        TicketPackageVO resultVO = new TicketPackageVO();
        resultVO.setId(1L);
        resultVO.setTotalTickets(20);
        resultVO.setStatus("ACTIVE");

        when(ticketService.sellPackage(any())).thenReturn(resultVO);

        mockMvc.perform(post("/api/v1/tickets/packages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalTickets").value(20))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("POST /api/v1/tickets/packages - 缺少必填字段返回400")
    void sellPackage_missingFields_returnsBadRequest() throws Exception {
        TicketSellDTO dto = new TicketSellDTO();
        dto.setCustomerId(1L);

        mockMvc.perform(post("/api/v1/tickets/packages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/tickets/redeem - 兑换水票成功")
    void redeemTickets_validData_returns200() throws Exception {
        TicketRedeemDTO dto = new TicketRedeemDTO();
        dto.setPackageId(1L);
        dto.setRedeemedQty(3);

        mockMvc.perform(post("/api/v1/tickets/redeem")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        verify(ticketService).redeemTickets(any());
    }

    @Test
    @DisplayName("POST /api/v1/tickets/redeem - 缺少套餐ID返回400")
    void redeemTickets_missingPackageId_returnsBadRequest() throws Exception {
        TicketRedeemDTO dto = new TicketRedeemDTO();
        dto.setRedeemedQty(3);

        mockMvc.perform(post("/api/v1/tickets/redeem")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }
}
