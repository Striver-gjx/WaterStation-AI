package com.waterstation.ai.controller;

import com.waterstation.ai.common.result.PageResult;
import com.waterstation.ai.common.result.Result;
import com.waterstation.ai.dto.TicketRedeemDTO;
import com.waterstation.ai.dto.TicketSellDTO;
import com.waterstation.ai.service.TicketService;
import com.waterstation.ai.vo.TicketPackageVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping("/packages")
    public Result<PageResult<TicketPackageVO>> listPackages(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return Result.success(ticketService.listPackages(customerId, status, page, size));
    }

    @GetMapping("/packages/{id}")
    public Result<TicketPackageVO> getPackage(@PathVariable Long id) {
        return Result.success(ticketService.getPackageById(id));
    }

    @PostMapping("/packages")
    public Result<TicketPackageVO> sellPackage(@Valid @RequestBody TicketSellDTO dto) {
        return Result.success(ticketService.sellPackage(dto));
    }

    @PostMapping("/redeem")
    public Result<Void> redeem(@Valid @RequestBody TicketRedeemDTO dto) {
        ticketService.redeemTickets(dto);
        return Result.success();
    }
}
