package com.waterstation.ai.service;

import com.waterstation.ai.common.exception.BusinessException;
import com.waterstation.ai.dto.ProductCreateDTO;
import com.waterstation.ai.dto.ProductUpdateDTO;
import com.waterstation.ai.vo.ProductVO;
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
@DisplayName("产品服务层集成测试")
class ProductServiceTest {

    @Autowired
    private ProductService productService;

    private ProductCreateDTO buildCreateDTO(String name, BigDecimal price) {
        ProductCreateDTO dto = new ProductCreateDTO();
        dto.setName(name);
        dto.setUnitPrice(price);
        return dto;
    }

    @Test
    @DisplayName("创建产品 - 设置默认值")
    void createProduct_validData_setsDefaults() {
        ProductVO result = productService.createProduct(buildCreateDTO("测试矿泉水", new BigDecimal("15.00")));

        assertThat(result).isNotNull();
        assertThat(result.getId()).isNotNull();
        assertThat(result.getName()).isEqualTo("测试矿泉水");
        assertThat(result.getCategory()).isEqualTo("water");
        assertThat(result.getStock()).isEqualTo(0);
        assertThat(result.getMaxStock()).isEqualTo(1000);
        assertThat(result.getMinStockAlert()).isEqualTo(50);
        assertThat(result.getStatus()).isEqualTo("OUT_OF_STOCK");
    }

    @Test
    @DisplayName("创建产品 - 有初始库存时状态正确")
    void createProduct_withStock_correctStatus() {
        ProductCreateDTO dto = buildCreateDTO("有库存产品", new BigDecimal("20.00"));
        dto.setStock(500);

        ProductVO result = productService.createProduct(dto);

        assertThat(result.getStock()).isEqualTo(500);
        assertThat(result.getStatus()).isEqualTo("IN_STOCK");
    }

    @Test
    @DisplayName("创建产品 - 低库存时状态为LOW_STOCK")
    void createProduct_lowStock_lowStockStatus() {
        ProductCreateDTO dto = buildCreateDTO("低库存产品", new BigDecimal("10.00"));
        dto.setStock(100);
        dto.setMaxStock(1000);

        ProductVO result = productService.createProduct(dto);

        assertThat(result.getStatus()).isEqualTo("LOW_STOCK");
    }

    @Test
    @DisplayName("根据ID查询产品 - 存在时返回VO")
    void getProductById_existing_returnsVO() {
        ProductVO created = productService.createProduct(buildCreateDTO("查询产品", new BigDecimal("25.00")));

        ProductVO found = productService.getProductById(created.getId());

        assertThat(found.getName()).isEqualTo("查询产品");
        assertThat(found.getUnitPrice()).isEqualByComparingTo(new BigDecimal("25.00"));
    }

    @Test
    @DisplayName("根据ID查询产品 - 不存在时抛出异常")
    void getProductById_nonExisting_throwsException() {
        assertThatThrownBy(() -> productService.getProductById(99999L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("产品不存在");
    }

    @Test
    @DisplayName("更新产品 - 部分更新")
    void updateProduct_partialUpdate_onlyChangesProvided() {
        ProductVO created = productService.createProduct(buildCreateDTO("原产品名", new BigDecimal("30.00")));

        ProductUpdateDTO updateDTO = new ProductUpdateDTO();
        updateDTO.setName("新产品名");

        productService.updateProduct(created.getId(), updateDTO);

        ProductVO updated = productService.getProductById(created.getId());
        assertThat(updated.getName()).isEqualTo("新产品名");
        assertThat(updated.getUnitPrice()).isEqualByComparingTo(new BigDecimal("30.00"));
    }

    @Test
    @DisplayName("更新产品 - 不存在时抛出异常")
    void updateProduct_nonExisting_throwsException() {
        ProductUpdateDTO dto = new ProductUpdateDTO();
        dto.setName("test");

        assertThatThrownBy(() -> productService.updateProduct(99999L, dto))
                .isInstanceOf(BusinessException.class)
                .hasMessage("产品不存在");
    }

    @Test
    @DisplayName("删除产品 - 正常删除")
    void deleteProduct_existing_succeeds() {
        ProductVO created = productService.createProduct(buildCreateDTO("待删产品", new BigDecimal("5.00")));

        productService.deleteProduct(created.getId());

        assertThatThrownBy(() -> productService.getProductById(created.getId()))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("删除产品 - 不存在时抛出异常")
    void deleteProduct_nonExisting_throwsException() {
        assertThatThrownBy(() -> productService.deleteProduct(99999L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("产品不存在");
    }

    @Test
    @DisplayName("库存调整 - 入库增加库存")
    void adjustStock_in_increasesStock() {
        ProductCreateDTO dto = buildCreateDTO("入库测试", new BigDecimal("10.00"));
        dto.setStock(100);
        ProductVO created = productService.createProduct(dto);

        productService.adjustStock(created.getId(), "IN", 50, "补货");

        ProductVO after = productService.getProductById(created.getId());
        assertThat(after.getStock()).isEqualTo(150);
    }

    @Test
    @DisplayName("库存调整 - 出库减少库存")
    void adjustStock_out_decreasesStock() {
        ProductCreateDTO dto = buildCreateDTO("出库测试", new BigDecimal("10.00"));
        dto.setStock(100);
        ProductVO created = productService.createProduct(dto);

        productService.adjustStock(created.getId(), "OUT", 30, "销售出库");

        ProductVO after = productService.getProductById(created.getId());
        assertThat(after.getStock()).isEqualTo(70);
    }

    @Test
    @DisplayName("库存调整 - 出库超过库存时抛出异常")
    void adjustStock_out_insufficientStock_throwsException() {
        ProductCreateDTO dto = buildCreateDTO("库存不足", new BigDecimal("10.00"));
        dto.setStock(10);
        ProductVO created = productService.createProduct(dto);

        assertThatThrownBy(() -> productService.adjustStock(created.getId(), "OUT", 20, null))
                .isInstanceOf(BusinessException.class)
                .hasMessage("库存不足");
    }

    @Test
    @DisplayName("库存调整 - 直接设定库存")
    void adjustStock_adjust_setsExactStock() {
        ProductCreateDTO dto = buildCreateDTO("调整测试", new BigDecimal("10.00"));
        dto.setStock(100);
        ProductVO created = productService.createProduct(dto);

        productService.adjustStock(created.getId(), "ADJUST", 500, "盘点调整");

        ProductVO after = productService.getProductById(created.getId());
        assertThat(after.getStock()).isEqualTo(500);
    }

    @Test
    @DisplayName("库存调整 - 数量为0时抛出异常")
    void adjustStock_zeroQuantity_throwsException() {
        ProductCreateDTO dto = buildCreateDTO("零数量", new BigDecimal("10.00"));
        dto.setStock(50);
        ProductVO created = productService.createProduct(dto);

        assertThatThrownBy(() -> productService.adjustStock(created.getId(), "IN", 0, null))
                .isInstanceOf(BusinessException.class)
                .hasMessage("数量必须大于0");
    }

    @Test
    @DisplayName("库存调整 - 无效变动类型抛出异常")
    void adjustStock_invalidChangeType_throwsException() {
        ProductCreateDTO dto = buildCreateDTO("无效类型", new BigDecimal("10.00"));
        dto.setStock(50);
        ProductVO created = productService.createProduct(dto);

        assertThatThrownBy(() -> productService.adjustStock(created.getId(), "INVALID", 10, null))
                .isInstanceOf(BusinessException.class)
                .hasMessage("无效的变动类型");
    }

    @Test
    @DisplayName("库存调整 - 出库至0时状态变为OUT_OF_STOCK")
    void adjustStock_out_toZero_statusOutOfStock() {
        ProductCreateDTO dto = buildCreateDTO("清空测试", new BigDecimal("10.00"));
        dto.setStock(50);
        ProductVO created = productService.createProduct(dto);

        productService.adjustStock(created.getId(), "OUT", 50, "清仓");

        ProductVO after = productService.getProductById(created.getId());
        assertThat(after.getStock()).isEqualTo(0);
        assertThat(after.getStatus()).isEqualTo("OUT_OF_STOCK");
    }

    @Test
    @DisplayName("查询列表 - 按分类筛选")
    void listProducts_filterByCategory_returnsFiltered() {
        List<ProductVO> allProducts = productService.listProducts(null, null);
        int initialCount = allProducts.size();

        ProductCreateDTO dto = buildCreateDTO("分类测试产品", new BigDecimal("10.00"));
        dto.setCategory("custom_category");
        dto.setStock(100);
        productService.createProduct(dto);

        List<ProductVO> filtered = productService.listProducts("custom_category", null);
        assertThat(filtered).hasSize(1);
        assertThat(filtered.get(0).getName()).isEqualTo("分类测试产品");
    }
}
