package com.waterstation.ai.service;

import com.waterstation.ai.common.exception.BusinessException;
import com.waterstation.ai.dto.*;
import com.waterstation.ai.entity.Delivery;
import com.waterstation.ai.mapper.DeliveryMapper;
import com.waterstation.ai.vo.CustomerVO;
import com.waterstation.ai.vo.DeliveryVO;
import com.waterstation.ai.vo.DriverVO;
import com.waterstation.ai.vo.OrderVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
@DisplayName("配送服务层集成测试")
class DeliveryServiceTest {

    @Autowired
    private DeliveryService deliveryService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private ProductService productService;

    @Autowired
    private DriverService driverService;

    @Autowired
    private DeliveryMapper deliveryMapper;

    private Long testOrderId;
    private Long testDriverId;
    private Long testDeliveryId;

    @BeforeEach
    void setUp() {
        CustomerCreateDTO customerDTO = new CustomerCreateDTO();
        customerDTO.setName("配送测试客户");
        customerDTO.setPhone("13900001111");
        customerDTO.setAddress("测试地址");
        CustomerVO customer = customerService.createCustomer(customerDTO);

        var products = productService.listProducts(null, null);
        if (products.isEmpty()) return;
        Long productId = products.get(0).getId();

        OrderCreateDTO orderDTO = new OrderCreateDTO();
        orderDTO.setCustomerId(customer.getId());
        orderDTO.setDeliveryAddress("北京市海淀区");
        OrderCreateDTO.OrderItemDTO item = new OrderCreateDTO.OrderItemDTO();
        item.setProductId(productId);
        item.setQuantity(2);
        orderDTO.setItems(List.of(item));
        OrderVO order = orderService.createOrder(orderDTO);
        testOrderId = order.getId();

        DriverCreateDTO driverDTO = new DriverCreateDTO();
        driverDTO.setName("测试配送员");
        driverDTO.setPhone("13900002222");
        DriverVO driver = driverService.createDriver(driverDTO);
        testDriverId = driver.getId();

        orderService.dispatchOrder(testOrderId, testDriverId);

        Delivery delivery = new Delivery();
        delivery.setOrderId(testOrderId);
        delivery.setDriverId(testDriverId);
        delivery.setStatus("PENDING");
        deliveryMapper.insert(delivery);
        testDeliveryId = delivery.getId();
    }

    @Test
    @DisplayName("根据ID查询配送 - 存在时返回VO")
    void getDeliveryById_existing_returnsVO() {
        if (testDeliveryId == null) return;

        DeliveryVO vo = deliveryService.getDeliveryById(testDeliveryId);

        assertThat(vo).isNotNull();
        assertThat(vo.getOrderId()).isEqualTo(testOrderId);
        assertThat(vo.getDriverId()).isEqualTo(testDriverId);
        assertThat(vo.getStatus()).isEqualTo("PENDING");
    }

    @Test
    @DisplayName("根据ID查询配送 - 不存在时抛出异常")
    void getDeliveryById_nonExisting_throwsException() {
        assertThatThrownBy(() -> deliveryService.getDeliveryById(99999L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("配送记录不存在");
    }

    @Test
    @DisplayName("根据订单ID查询 - 存在时返回VO")
    void getByOrderId_existing_returnsVO() {
        if (testDeliveryId == null) return;

        DeliveryVO vo = deliveryService.getByOrderId(testOrderId);

        assertThat(vo).isNotNull();
        assertThat(vo.getId()).isEqualTo(testDeliveryId);
    }

    @Test
    @DisplayName("根据订单ID查询 - 不存在时抛出异常")
    void getByOrderId_nonExisting_throwsException() {
        assertThatThrownBy(() -> deliveryService.getByOrderId(99999L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("该订单无配送记录");
    }

    @Test
    @DisplayName("取货 - 正常取货更新状态")
    void pickupDelivery_pending_changesStatus() {
        if (testDeliveryId == null) return;

        deliveryService.pickupDelivery(testDeliveryId);

        DeliveryVO vo = deliveryService.getDeliveryById(testDeliveryId);
        assertThat(vo.getStatus()).isEqualTo("PICKED_UP");
        assertThat(vo.getPickupTime()).isNotNull();
    }

    @Test
    @DisplayName("取货 - 非PENDING状态抛出异常")
    void pickupDelivery_notPending_throwsException() {
        if (testDeliveryId == null) return;

        deliveryService.pickupDelivery(testDeliveryId);

        assertThatThrownBy(() -> deliveryService.pickupDelivery(testDeliveryId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("当前状态不允许取货");
    }

    @Test
    @DisplayName("取货 - 不存在时抛出异常")
    void pickupDelivery_nonExisting_throwsException() {
        assertThatThrownBy(() -> deliveryService.pickupDelivery(99999L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("配送记录不存在");
    }

    @Test
    @DisplayName("完成配送 - 正常完成并更新订单和司机统计")
    void completeDelivery_valid_updatesAll() {
        if (testDeliveryId == null) return;

        DeliveryCompleteDTO dto = new DeliveryCompleteDTO();
        dto.setGpsLatitude(new BigDecimal("39.9"));
        dto.setGpsLongitude(new BigDecimal("116.3"));
        dto.setEmptyBucketsCollected(2);
        dto.setCustomerSigned(true);
        dto.setRemark("客户已签收");

        deliveryService.completeDelivery(testDeliveryId, dto);

        DeliveryVO vo = deliveryService.getDeliveryById(testDeliveryId);
        assertThat(vo.getStatus()).isEqualTo("DELIVERED");
        assertThat(vo.getDeliveredTime()).isNotNull();
        assertThat(vo.getEmptyBucketsCollected()).isEqualTo(2);
        assertThat(vo.getCustomerSigned()).isTrue();

        DriverVO driver = driverService.getDriverById(testDriverId);
        assertThat(driver.getTotalDeliveries()).isEqualTo(1);

        OrderVO order = orderService.getOrderById(testOrderId);
        assertThat(order.getStatus()).isEqualTo("DELIVERED");
    }

    @Test
    @DisplayName("完成配送 - 不存在时抛出异常")
    void completeDelivery_nonExisting_throwsException() {
        DeliveryCompleteDTO dto = new DeliveryCompleteDTO();
        dto.setGpsLatitude(new BigDecimal("39.9"));
        dto.setGpsLongitude(new BigDecimal("116.3"));
        dto.setEmptyBucketsCollected(0);
        dto.setCustomerSigned(false);

        assertThatThrownBy(() -> deliveryService.completeDelivery(99999L, dto))
                .isInstanceOf(BusinessException.class)
                .hasMessage("配送记录不存在");
    }

    @Test
    @DisplayName("VO包含配送员姓名")
    void getDeliveryById_voContainsDriverName() {
        if (testDeliveryId == null) return;

        DeliveryVO vo = deliveryService.getDeliveryById(testDeliveryId);

        assertThat(vo.getDriverName()).isEqualTo("测试配送员");
    }
}
