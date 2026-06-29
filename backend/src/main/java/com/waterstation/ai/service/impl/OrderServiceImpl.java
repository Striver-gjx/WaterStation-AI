package com.waterstation.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.waterstation.ai.common.exception.BusinessException;
import com.waterstation.ai.common.result.PageResult;
import com.waterstation.ai.dto.OrderCreateDTO;
import com.waterstation.ai.entity.Customer;
import com.waterstation.ai.entity.Order;
import com.waterstation.ai.entity.OrderItem;
import com.waterstation.ai.entity.Product;
import com.waterstation.ai.mapper.OrderMapper;
import com.waterstation.ai.mapper.OrderItemMapper;
import com.waterstation.ai.mapper.CustomerMapper;
import com.waterstation.ai.mapper.ProductMapper;
import com.waterstation.ai.service.OrderService;
import com.waterstation.ai.vo.OrderVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements OrderService {

    private final OrderItemMapper orderItemMapper;
    private final CustomerMapper customerMapper;
    private final ProductMapper productMapper;

    @Override
    public PageResult<OrderVO> listOrders(Integer page, Integer size, String status, Long customerId, Long driverId) {
        LambdaQueryWrapper<Order> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(status)) {
            wrapper.eq(Order::getStatus, status);
        }
        if (customerId != null) {
            wrapper.eq(Order::getCustomerId, customerId);
        }
        if (driverId != null) {
            wrapper.eq(Order::getDriverId, driverId);
        }
        wrapper.orderByDesc(Order::getCreatedAt);

        Page<Order> pageResult = page(new Page<>(page, size), wrapper);
        List<OrderVO> voList = pageResult.getRecords().stream()
                .map(this::toVO)
                .toList();
        return PageResult.of(pageResult.getTotal(), voList);
    }

    @Override
    public OrderVO getOrderById(Long id) {
        Order order = getById(id);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        return toVO(order);
    }

    @Override
    @Transactional
    public OrderVO createOrder(OrderCreateDTO dto) {
        Customer customer = customerMapper.selectById(dto.getCustomerId());
        if (customer == null) {
            throw new BusinessException("客户不存在");
        }

        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setCustomerId(dto.getCustomerId());
        order.setDeliveryAddress(dto.getDeliveryAddress());
        order.setScheduledDate(dto.getScheduledDate());
        order.setScheduledTimeSlot(dto.getScheduledTimeSlot());
        order.setRemark(dto.getRemark());
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setStatus("PENDING_PAYMENT");
        order.setPaidAmount(BigDecimal.ZERO);
        order.setTotalAmount(BigDecimal.ZERO);

        BigDecimal totalAmount = BigDecimal.ZERO;
        save(order);

        for (OrderCreateDTO.OrderItemDTO itemDTO : dto.getItems()) {
            Product product = productMapper.selectById(itemDTO.getProductId());
            if (product == null) {
                throw new BusinessException("产品不存在: " + itemDTO.getProductId());
            }

            OrderItem item = new OrderItem();
            item.setOrderId(order.getId());
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setUnitPrice(product.getUnitPrice());
            item.setQuantity(itemDTO.getQuantity());
            item.setSubtotal(product.getUnitPrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));
            orderItemMapper.insert(item);

            totalAmount = totalAmount.add(item.getSubtotal());
        }

        order.setTotalAmount(totalAmount);
        updateById(order);

        customer.setLifetimeOrders(customer.getLifetimeOrders() + 1);
        customer.setOutstandingBalance(customer.getOutstandingBalance().add(totalAmount));
        customerMapper.updateById(customer);

        return toVO(order);
    }

    @Override
    public void updateOrderStatus(Long id, String status, String cancelReason) {
        Order order = getById(id);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        order.setStatus(status);
        if ("CANCELLED".equals(status)) {
            order.setCancelReason(cancelReason);
        }
        if ("COMPLETED".equals(status)) {
            order.setCompletedAt(LocalDateTime.now());
        }
        updateById(order);
    }

    @Override
    public void dispatchOrder(Long id, Long driverId) {
        Order order = getById(id);
        if (order == null) {
            throw new BusinessException("订单不存在");
        }
        order.setDriverId(driverId);
        order.setStatus("DISPATCHING");
        updateById(order);
    }

    @Override
    public void deleteOrder(Long id) {
        if (getById(id) == null) {
            throw new BusinessException("订单不存在");
        }
        removeById(id);
    }

    private String generateOrderNo() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int random = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "WS" + timestamp + random;
    }

    private OrderVO toVO(Order order) {
        OrderVO vo = new OrderVO();
        BeanUtils.copyProperties(order, vo);

        Customer customer = customerMapper.selectById(order.getCustomerId());
        if (customer != null) {
            vo.setCustomerName(customer.getName());
        }
        return vo;
    }
}
