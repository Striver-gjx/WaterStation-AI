package com.waterstation.ai.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.waterstation.ai.entity.Bucket;
import com.waterstation.ai.vo.BucketVO;
import java.math.BigDecimal;
import java.util.List;

public interface BucketService extends IService<Bucket> {
    List<BucketVO> listBuckets(Long customerId, String status);
    void issueBucket(Long customerId, String bucketType, BigDecimal depositAmount);
    void returnBucket(Long id);
}
