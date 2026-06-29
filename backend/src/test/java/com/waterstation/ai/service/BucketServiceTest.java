package com.waterstation.ai.service;

import com.waterstation.ai.common.exception.BusinessException;
import com.waterstation.ai.dto.CustomerCreateDTO;
import com.waterstation.ai.service.BucketService;
import com.waterstation.ai.service.CustomerService;
import com.waterstation.ai.vo.BucketVO;
import com.waterstation.ai.vo.CustomerVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
@DisplayName("桶管理服务层集成测试")
class BucketServiceTest {

    @Autowired
    private BucketService bucketService;

    @Autowired
    private CustomerService customerService;

    private Long testCustomerId;

    @BeforeEach
    void setUp() {
        CustomerCreateDTO dto = new CustomerCreateDTO();
        dto.setName("桶测试客户");
        dto.setPhone("13700001111");
        dto.setAddress("测试地址");
        CustomerVO customer = customerService.createCustomer(dto);
        testCustomerId = customer.getId();
    }

    @Test
    @DisplayName("发放桶 - 默认类型和押金")
    void issueBucket_defaults_setsStandardValues() {
        bucketService.issueBucket(testCustomerId, null, null);

        List<BucketVO> buckets = bucketService.listBuckets(testCustomerId, null);
        assertThat(buckets).hasSize(1);
        assertThat(buckets.get(0).getBucketType()).isEqualTo("STANDARD_20L");
        assertThat(buckets.get(0).getDepositAmount()).isEqualByComparingTo(new BigDecimal("50.00"));
        assertThat(buckets.get(0).getStatus()).isEqualTo("WITH_CUSTOMER");
    }

    @Test
    @DisplayName("发放桶 - 自定义类型和押金")
    void issueBucket_customParams_usesProvided() {
        bucketService.issueBucket(testCustomerId, "PREMIUM_18L", new BigDecimal("80.00"));

        List<BucketVO> buckets = bucketService.listBuckets(testCustomerId, null);
        assertThat(buckets).hasSize(1);
        assertThat(buckets.get(0).getBucketType()).isEqualTo("PREMIUM_18L");
        assertThat(buckets.get(0).getDepositAmount()).isEqualByComparingTo(new BigDecimal("80.00"));
    }

    @Test
    @DisplayName("发放桶 - 客户不存在时抛出异常")
    void issueBucket_nonExistingCustomer_throwsException() {
        assertThatThrownBy(() -> bucketService.issueBucket(99999L, null, null))
                .isInstanceOf(BusinessException.class)
                .hasMessage("客户不存在");
    }

    @Test
    @DisplayName("退还桶 - 正常退还")
    void returnBucket_validBucket_changesStatus() {
        bucketService.issueBucket(testCustomerId, null, null);
        List<BucketVO> buckets = bucketService.listBuckets(testCustomerId, "WITH_CUSTOMER");
        Long bucketId = buckets.get(0).getId();

        bucketService.returnBucket(bucketId);

        List<BucketVO> returned = bucketService.listBuckets(testCustomerId, "RETURNED");
        assertThat(returned).hasSize(1);
        assertThat(returned.get(0).getReturnedDate()).isNotNull();
    }

    @Test
    @DisplayName("退还桶 - 桶不存在时抛出异常")
    void returnBucket_nonExisting_throwsException() {
        assertThatThrownBy(() -> bucketService.returnBucket(99999L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("桶记录不存在");
    }

    @Test
    @DisplayName("退还桶 - 已退还的桶不能再退")
    void returnBucket_alreadyReturned_throwsException() {
        bucketService.issueBucket(testCustomerId, null, null);
        List<BucketVO> buckets = bucketService.listBuckets(testCustomerId, null);
        Long bucketId = buckets.get(0).getId();

        bucketService.returnBucket(bucketId);

        assertThatThrownBy(() -> bucketService.returnBucket(bucketId))
                .isInstanceOf(BusinessException.class)
                .hasMessage("该桶不在客户手中，无法退还");
    }

    @Test
    @DisplayName("列表查询 - 按状态筛选")
    void listBuckets_filterByStatus_returnsMatching() {
        bucketService.issueBucket(testCustomerId, null, null);
        bucketService.issueBucket(testCustomerId, "LARGE_25L", new BigDecimal("60.00"));

        List<BucketVO> buckets = bucketService.listBuckets(testCustomerId, null);
        Long firstId = buckets.get(0).getId();
        bucketService.returnBucket(firstId);

        List<BucketVO> withCustomer = bucketService.listBuckets(testCustomerId, "WITH_CUSTOMER");
        assertThat(withCustomer).hasSize(1);

        List<BucketVO> returned = bucketService.listBuckets(testCustomerId, "RETURNED");
        assertThat(returned).hasSize(1);
    }

    @Test
    @DisplayName("列表查询 - 无筛选返回所有")
    void listBuckets_noFilter_returnsAll() {
        bucketService.issueBucket(testCustomerId, null, null);
        bucketService.issueBucket(testCustomerId, null, null);

        List<BucketVO> all = bucketService.listBuckets(null, null);
        assertThat(all.size()).isGreaterThanOrEqualTo(2);
    }

    @Test
    @DisplayName("列表查询 - VO包含客户姓名")
    void listBuckets_returnsCustomerName() {
        bucketService.issueBucket(testCustomerId, null, null);

        List<BucketVO> buckets = bucketService.listBuckets(testCustomerId, null);
        assertThat(buckets.get(0).getCustomerName()).isEqualTo("桶测试客户");
    }
}
