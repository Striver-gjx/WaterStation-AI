package com.waterstation.ai.controller;

import com.waterstation.ai.common.result.Result;
import com.waterstation.ai.dto.DeliveryCompleteDTO;
import com.waterstation.ai.service.DeliveryService;
import com.waterstation.ai.vo.DeliveryVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping("/{id}")
    public Result<DeliveryVO> get(@PathVariable Long id) {
        return Result.success(deliveryService.getDeliveryById(id));
    }

    @PostMapping("/{id}/pickup")
    public Result<Void> pickup(@PathVariable Long id) {
        deliveryService.pickupDelivery(id);
        return Result.success();
    }

    @PostMapping("/{id}/complete")
    public Result<Void> complete(@PathVariable Long id, @Valid @RequestBody DeliveryCompleteDTO dto) {
        deliveryService.completeDelivery(id, dto);
        return Result.success();
    }
}
