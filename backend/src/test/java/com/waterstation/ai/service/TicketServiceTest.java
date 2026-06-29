package com.waterstation.ai.service;

import com.waterstation.ai.common.exception.BusinessException;
import com.waterstation.ai.dto.CustomerCreateDTO;
import com.waterstation.ai.dto.ProductCreateDTO;
import com.waterstation.ai.dto.TicketRedeemDTO;
import com.waterstation.ai.dto.TicketSellDTO;
import com.waterstation.ai.vo.CustomerVO;
import com.waterstation.ai.vo.ProductVO;
import com.waterstation.ai.vo.TicketPackageVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
@DisplayName("水票服务层集成测试")
class TicketServiceTest {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private ProductService productService;

    private Long testCustomerId;
    private Long testProductId;

    @BeforeEach
    void setUp() {
        CustomerCreateDTO customerDTO = new CustomerCreateDTO();
        customerDTO.setName("水票测试客户");
        customerDTO.setPhone("13500001111");
        customerDTO.setAddress("测试地址");
        CustomerVO customer = customerService.createCustomer(customerDTO);
        testCustomerId = customer.getId();

        ProductCreateDTO productDTO = new ProductCreateDTO();
        productDTO.setName("水票测试产品");
        productDTO.setUnitPrice(new BigDecimal("18.00"));
        productDTO.setStock(200);
        ProductVO product = productService.createProduct(productDTO);
        testProductId = product.getId();
    }

    private TicketSellDTO buildSellDTO(int tickets, BigDecimal price) {
        TicketSellDTO dto = new TicketSellDTO();
        dto.setCustomerId(testCustomerId);
        dto.setProductId(testProductId);
        dto.setTotalTickets(tickets);
        dto.setPricePaid(price);
        return dto;
    }

    @Test
    @DisplayName("售出水票 - 正常售出")
    void sellPackage_validData_createsPackage() {
        TicketPackageVO result = ticketService.sellPackage(buildSellDTO(20, new BigDecimal("300.00")));

        assertThat(result).isNotNull();
        assertThat(result.getId()).isNotNull();
        assertThat(result.getTotalTickets()).isEqualTo(20);
        assertThat(result.getRemainingTickets()).isEqualTo(20);
        assertThat(result.getStatus()).isEqualTo("ACTIVE");
        assertThat(result.getUnitPrice()).isEqualByComparingTo(new BigDecimal("15.00"));
        assertThat(result.getCustomerName()).isEqualTo("水票测试客户");
        assertThat(result.getProductName()).isEqualTo("水票测试产品");
    }

    @Test
    @DisplayName("售出水票 - 更新客户累计数据")
    void sellPackage_updatesCustomerStats() {
        ticketService.sellPackage(buildSellDTO(10, new BigDecimal("150.00")));

        CustomerVO customer = customerService.getCustomerById(testCustomerId);
        assertThat(customer.getActiveTickets()).isEqualTo(10);
        assertThat(customer.getTotalSpent()).isEqualByComparingTo(new BigDecimal("150.00"));
        assertThat(customer.getLifetimeOrders()).isEqualTo(1);
    }

    @Test
    @DisplayName("售出水票 - 客户不存在时抛出异常")
    void sellPackage_nonExistingCustomer_throwsException() {
        TicketSellDTO dto = buildSellDTO(10, new BigDecimal("100.00"));
        dto.setCustomerId(99999L);

        assertThatThrownBy(() -> ticketService.sellPackage(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessage("客户不存在");
    }

    @Test
    @DisplayName("售出水票 - 产品不存在时抛出异常")
    void sellPackage_nonExistingProduct_throwsException() {
        TicketSellDTO dto = buildSellDTO(10, new BigDecimal("100.00"));
        dto.setProductId(99999L);

        assertThatThrownBy(() -> ticketService.sellPackage(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessage("产品不存在");
    }

    @Test
    @DisplayName("售出水票 - 设置过期天数")
    void sellPackage_withExpireDays_setsExpireDate() {
        TicketSellDTO dto = buildSellDTO(5, new BigDecimal("50.00"));
        dto.setExpireDays(180);

        TicketPackageVO result = ticketService.sellPackage(dto);

        assertThat(result.getExpireDate()).isNotNull();
        assertThat(result.getPurchaseDate()).isNotNull();
    }

    @Test
    @DisplayName("兑换水票 - 正常兑换扣减余量")
    void redeemTickets_validData_reducesRemaining() {
        TicketPackageVO pkg = ticketService.sellPackage(buildSellDTO(10, new BigDecimal("150.00")));

        TicketRedeemDTO redeemDTO = new TicketRedeemDTO();
        redeemDTO.setPackageId(pkg.getId());
        redeemDTO.setRedeemedQty(3);
        redeemDTO.setRemark("配送兑换");

        ticketService.redeemTickets(redeemDTO);

        TicketPackageVO after = ticketService.getPackageById(pkg.getId());
        assertThat(after.getRemainingTickets()).isEqualTo(7);
        assertThat(after.getStatus()).isEqualTo("ACTIVE");
    }

    @Test
    @DisplayName("兑换水票 - 兑换全部后状态变为DEPLETED")
    void redeemTickets_allRedeemed_statusDepleted() {
        TicketPackageVO pkg = ticketService.sellPackage(buildSellDTO(5, new BigDecimal("75.00")));

        TicketRedeemDTO redeemDTO = new TicketRedeemDTO();
        redeemDTO.setPackageId(pkg.getId());
        redeemDTO.setRedeemedQty(5);

        ticketService.redeemTickets(redeemDTO);

        TicketPackageVO after = ticketService.getPackageById(pkg.getId());
        assertThat(after.getRemainingTickets()).isEqualTo(0);
        assertThat(after.getStatus()).isEqualTo("DEPLETED");
    }

    @Test
    @DisplayName("兑换水票 - 更新客户活跃水票数")
    void redeemTickets_updatesCustomerActiveTickets() {
        ticketService.sellPackage(buildSellDTO(10, new BigDecimal("150.00")));

        TicketPackageVO pkg = ticketService.listPackages(testCustomerId, null, 1, 10).getList().get(0);

        TicketRedeemDTO redeemDTO = new TicketRedeemDTO();
        redeemDTO.setPackageId(pkg.getId());
        redeemDTO.setRedeemedQty(4);

        ticketService.redeemTickets(redeemDTO);

        CustomerVO customer = customerService.getCustomerById(testCustomerId);
        assertThat(customer.getActiveTickets()).isEqualTo(6);
    }

    @Test
    @DisplayName("兑换水票 - 套餐不存在时抛出异常")
    void redeemTickets_nonExistingPackage_throwsException() {
        TicketRedeemDTO dto = new TicketRedeemDTO();
        dto.setPackageId(99999L);
        dto.setRedeemedQty(1);

        assertThatThrownBy(() -> ticketService.redeemTickets(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessage("水票套餐不存在");
    }

    @Test
    @DisplayName("兑换水票 - 剩余不足时抛出异常")
    void redeemTickets_insufficientRemaining_throwsException() {
        TicketPackageVO pkg = ticketService.sellPackage(buildSellDTO(3, new BigDecimal("45.00")));

        TicketRedeemDTO redeemDTO = new TicketRedeemDTO();
        redeemDTO.setPackageId(pkg.getId());
        redeemDTO.setRedeemedQty(5);

        assertThatThrownBy(() -> ticketService.redeemTickets(redeemDTO))
                .isInstanceOf(BusinessException.class)
                .hasMessage("剩余水票不足");
    }

    @Test
    @DisplayName("查询套餐 - 不存在时抛出异常")
    void getPackageById_nonExisting_throwsException() {
        assertThatThrownBy(() -> ticketService.getPackageById(99999L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("水票套餐不存在");
    }

    @Test
    @DisplayName("分页查询 - 按客户筛选")
    void listPackages_byCustomer_filtersResults() {
        ticketService.sellPackage(buildSellDTO(10, new BigDecimal("100.00")));

        var result = ticketService.listPackages(testCustomerId, null, 1, 10);

        assertThat(result.getTotal()).isGreaterThanOrEqualTo(1);
        assertThat(result.getList()).allMatch(v -> v.getCustomerId().equals(testCustomerId));
    }

    @Test
    @DisplayName("分页查询 - 按状态筛选")
    void listPackages_byStatus_filtersResults() {
        ticketService.sellPackage(buildSellDTO(10, new BigDecimal("100.00")));

        var active = ticketService.listPackages(null, "ACTIVE", 1, 10);
        assertThat(active.getList()).allMatch(v -> "ACTIVE".equals(v.getStatus()));
    }
}
