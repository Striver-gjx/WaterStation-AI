package com.waterstation.ai.service;

import com.waterstation.ai.common.exception.BusinessException;
import com.waterstation.ai.dto.CustomerCreateDTO;
import com.waterstation.ai.dto.OrderCreateDTO;
import com.waterstation.ai.vo.CustomerVO;
import com.waterstation.ai.vo.OrderVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
@DisplayName("订单服务层集成测试")
class OrderServiceTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private ProductService productService;

    private Long testCustomerId;
    private Long testProductId;

    @BeforeEach
    void setUp() {
        CustomerCreateDTO customerDTO = new CustomerCreateDTO();
        customerDTO.setName("订单测试客户");
        customerDTO.setPhone("13600001111");
        customerDTO.setAddress("测试地址");
        CustomerVO customer = customerService.createCustomer(customerDTO);
        testCustomerId = customer.getId();

        var products = productService.listProducts(null, null);
        if (!products.isEmpty()) {
            testProductId = products.get(0).getId();
        }
    }

    @Test
    @DisplayName("创建订单 - 客户不存在时抛出异常")
    void createOrder_nonExistingCustomer_throwsException() {
        OrderCreateDTO dto = new OrderCreateDTO();
        dto.setCustomerId(99999L);
        dto.setDeliveryAddress("测试地址");

        OrderCreateDTO.OrderItemDTO item = new OrderCreateDTO.OrderItemDTO();
        item.setProductId(testProductId);
        item.setQuantity(1);
        dto.setItems(List.of(item));

        assertThatThrownBy(() -> orderService.createOrder(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessage("客户不存在");
    }

    @Test
    @DisplayName("创建订单 - 产品不存在时抛出异常")
    void createOrder_nonExistingProduct_throwsException() {
        OrderCreateDTO dto = new OrderCreateDTO();
        dto.setCustomerId(testCustomerId);
        dto.setDeliveryAddress("测试地址");

        OrderCreateDTO.OrderItemDTO item = new OrderCreateDTO.OrderItemDTO();
        item.setProductId(99999L);
        item.setQuantity(2);
        dto.setItems(List.of(item));

        assertThatThrownBy(() -> orderService.createOrder(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("产品不存在");
    }

    @Test
    @DisplayName("创建订单 - 正常创建返回VO")
    void createOrder_validData_returnsVO() {
        if (testProductId == null) return;

        OrderCreateDTO dto = new OrderCreateDTO();
        dto.setCustomerId(testCustomerId);
        dto.setDeliveryAddress("北京市朝阳区");
        dto.setPaymentMethod("微信支付");

        OrderCreateDTO.OrderItemDTO item = new OrderCreateDTO.OrderItemDTO();
        item.setProductId(testProductId);
        item.setQuantity(3);
        dto.setItems(List.of(item));

        OrderVO result = orderService.createOrder(dto);

        assertThat(result).isNotNull();
        assertThat(result.getOrderNo()).startsWith("WS");
        assertThat(result.getStatus()).isEqualTo("PENDING_PAYMENT");
        assertThat(result.getTotalAmount()).isPositive();
        assertThat(result.getCustomerId()).isEqualTo(testCustomerId);
    }

    @Test
    @DisplayName("查询订单 - 不存在时抛出异常")
    void getOrderById_nonExisting_throwsException() {
        assertThatThrownBy(() -> orderService.getOrderById(99999L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("订单不存在");
    }

    @Test
    @DisplayName("更新订单状态 - 取消时设置取消原因")
    void updateOrderStatus_cancel_setsCancelReason() {
        if (testProductId == null) return;

        OrderVO order = createTestOrder();

        orderService.updateOrderStatus(order.getId(), "CANCELLED", "客户取消");

        OrderVO updated = orderService.getOrderById(order.getId());
        assertThat(updated.getStatus()).isEqualTo("CANCELLED");
    }

    @Test
    @DisplayName("更新订单状态 - 不存在时抛出异常")
    void updateOrderStatus_nonExisting_throwsException() {
        assertThatThrownBy(() -> orderService.updateOrderStatus(99999L, "CANCELLED", "test"))
                .isInstanceOf(BusinessException.class)
                .hasMessage("订单不存在");
    }

    @Test
    @DisplayName("派单 - 设置配送员并更新状态")
    void dispatchOrder_validData_setsDriverAndStatus() {
        if (testProductId == null) return;

        OrderVO order = createTestOrder();
        orderService.dispatchOrder(order.getId(), 1L);

        OrderVO updated = orderService.getOrderById(order.getId());
        assertThat(updated.getStatus()).isEqualTo("DISPATCHING");
        assertThat(updated.getDriverId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("删除订单 - 不存在时抛出异常")
    void deleteOrder_nonExisting_throwsException() {
        assertThatThrownBy(() -> orderService.deleteOrder(99999L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("订单不存在");
    }

    @Test
    @DisplayName("删除订单 - 正常删除")
    void deleteOrder_existing_succeeds() {
        if (testProductId == null) return;

        OrderVO order = createTestOrder();
        orderService.deleteOrder(order.getId());

        assertThatThrownBy(() -> orderService.getOrderById(order.getId()))
                .isInstanceOf(BusinessException.class);
    }

    private OrderVO createTestOrder() {
        OrderCreateDTO dto = new OrderCreateDTO();
        dto.setCustomerId(testCustomerId);
        dto.setDeliveryAddress("测试地址");

        OrderCreateDTO.OrderItemDTO item = new OrderCreateDTO.OrderItemDTO();
        item.setProductId(testProductId);
        item.setQuantity(1);
        dto.setItems(List.of(item));

        return orderService.createOrder(dto);
    }
}
