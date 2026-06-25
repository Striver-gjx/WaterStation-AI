package com.waterstation.ai.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.waterstation.ai.common.result.PageResult;
import com.waterstation.ai.dto.TicketRedeemDTO;
import com.waterstation.ai.dto.TicketSellDTO;
import com.waterstation.ai.entity.TicketPackage;
import com.waterstation.ai.vo.TicketPackageVO;

public interface TicketService extends IService<TicketPackage> {
    PageResult<TicketPackageVO> listPackages(Long customerId, String status, Integer page, Integer size);
    TicketPackageVO getPackageById(Long id);
    TicketPackageVO sellPackage(TicketSellDTO dto);
    void redeemTickets(TicketRedeemDTO dto);
}
