package com.waterstation.ai.controller;

import com.waterstation.ai.common.result.Result;
import com.waterstation.ai.service.BucketService;
import com.waterstation.ai.vo.BucketVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/tickets/buckets")
@RequiredArgsConstructor
public class BucketController {

    private final BucketService bucketService;

    @GetMapping
    public Result<List<BucketVO>> list(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String status) {
        return Result.success(bucketService.listBuckets(customerId, status));
    }

    @PostMapping("/issue")
    public Result<Void> issue(@RequestBody Map<String, Object> body) {
        Long customerId = Long.valueOf(body.get("customerId").toString());
        String bucketType = body.containsKey("bucketType") ? body.get("bucketType").toString() : null;
        BigDecimal depositAmount = body.containsKey("depositAmount")
                ? new BigDecimal(body.get("depositAmount").toString()) : null;
        bucketService.issueBucket(customerId, bucketType, depositAmount);
        return Result.success();
    }

    @PostMapping("/{id}/return")
    public Result<Void> returnBucket(@PathVariable Long id) {
        bucketService.returnBucket(id);
        return Result.success();
    }
}
