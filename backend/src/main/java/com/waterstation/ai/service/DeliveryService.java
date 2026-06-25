package com.waterstation.ai.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.waterstation.ai.dto.DeliveryCompleteDTO;
import com.waterstation.ai.entity.Delivery;
import com.waterstation.ai.vo.DeliveryVO;

public interface DeliveryService extends IService<Delivery> {
    DeliveryVO getDeliveryById(Long id);
    DeliveryVO getByOrderId(Long orderId);
    void pickupDelivery(Long id);
    void completeDelivery(Long id, DeliveryCompleteDTO dto);
}
