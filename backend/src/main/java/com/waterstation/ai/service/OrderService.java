package com.waterstation.ai.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.waterstation.ai.common.result.PageResult;
import com.waterstation.ai.dto.OrderCreateDTO;
import com.waterstation.ai.entity.Order;
import com.waterstation.ai.vo.OrderVO;

public interface OrderService extends IService<Order> {
    PageResult<OrderVO> listOrders(Integer page, Integer size, String status, Long customerId, Long driverId);
    OrderVO getOrderById(Long id);
    OrderVO createOrder(OrderCreateDTO dto);
    void updateOrderStatus(Long id, String status, String cancelReason);
    void dispatchOrder(Long id, Long driverId);
    void deleteOrder(Long id);
}
