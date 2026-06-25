package com.waterstation.ai.controller;

import com.waterstation.ai.common.result.PageResult;
import com.waterstation.ai.common.result.Result;
import com.waterstation.ai.dto.OrderCreateDTO;
import com.waterstation.ai.service.OrderService;
import com.waterstation.ai.vo.OrderVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public Result<PageResult<OrderVO>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long driverId) {
        return Result.success(orderService.listOrders(page, size, status, customerId, driverId));
    }

    @GetMapping("/{id}")
    public Result<OrderVO> get(@PathVariable Long id) {
        return Result.success(orderService.getOrderById(id));
    }

    @PostMapping
    public Result<OrderVO> create(@Valid @RequestBody OrderCreateDTO dto) {
        return Result.success(orderService.createOrder(dto));
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        String cancelReason = body.get("cancelReason");
        orderService.updateOrderStatus(id, newStatus, cancelReason);
        return Result.success();
    }

    @PostMapping("/{id}/dispatch")
    public Result<Void> dispatch(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        orderService.dispatchOrder(id, body.get("driverId"));
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return Result.success();
    }
}
