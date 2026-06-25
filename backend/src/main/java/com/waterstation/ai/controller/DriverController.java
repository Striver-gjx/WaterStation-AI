package com.waterstation.ai.controller;

import com.waterstation.ai.common.result.Result;
import com.waterstation.ai.dto.DriverCreateDTO;
import com.waterstation.ai.dto.DriverUpdateDTO;
import com.waterstation.ai.service.DriverService;
import com.waterstation.ai.vo.DriverVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @GetMapping
    public Result<List<DriverVO>> list(@RequestParam(required = false) String status) {
        return Result.success(driverService.listDrivers(status));
    }

    @GetMapping("/{id}")
    public Result<DriverVO> get(@PathVariable Long id) {
        return Result.success(driverService.getDriverById(id));
    }

    @PostMapping
    public Result<DriverVO> create(@Valid @RequestBody DriverCreateDTO dto) {
        return Result.success(driverService.createDriver(dto));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody DriverUpdateDTO dto) {
        driverService.updateDriver(id, dto);
        return Result.success();
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        driverService.updateDriverStatus(id, body.get("status"));
        return Result.success();
    }

    @PutMapping("/{id}/location")
    public Result<Void> updateLocation(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        BigDecimal lat = new BigDecimal(body.get("latitude").toString());
        BigDecimal lng = new BigDecimal(body.get("longitude").toString());
        driverService.updateDriverLocation(id, lat, lng);
        return Result.success();
    }
}
