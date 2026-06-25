package com.waterstation.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.waterstation.ai.common.exception.BusinessException;
import com.waterstation.ai.dto.ProductCreateDTO;
import com.waterstation.ai.dto.ProductUpdateDTO;
import com.waterstation.ai.entity.Product;
import com.waterstation.ai.mapper.ProductMapper;
import com.waterstation.ai.service.ProductService;
import com.waterstation.ai.vo.ProductVO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {

    @Override
    public List<ProductVO> listProducts(String category, String status) {
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(category)) {
            wrapper.eq(Product::getCategory, category);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(Product::getStatus, status);
        }
        wrapper.orderByAsc(Product::getSortOrder);

        return list(wrapper).stream().map(this::toVO).toList();
    }

    @Override
    public ProductVO getProductById(Long id) {
        Product product = getById(id);
        if (product == null) {
            throw new BusinessException("产品不存在");
        }
        return toVO(product);
    }

    @Override
    public ProductVO createProduct(ProductCreateDTO dto) {
        Product product = new Product();
        BeanUtils.copyProperties(dto, product);
        if (product.getCategory() == null) product.setCategory("water");
        if (product.getStock() == null) product.setStock(0);
        if (product.getMaxStock() == null) product.setMaxStock(1000);
        if (product.getMinStockAlert() == null) product.setMinStockAlert(50);
        product.setStatus(calculateStatus(product.getStock(), product.getMaxStock()));
        product.setSortOrder(0);
        save(product);
        return toVO(product);
    }

    @Override
    public void updateProduct(Long id, ProductUpdateDTO dto) {
        Product product = getById(id);
        if (product == null) {
            throw new BusinessException("产品不存在");
        }

        if (StringUtils.hasText(dto.getName())) product.setName(dto.getName());
        if (dto.getCategory() != null) product.setCategory(dto.getCategory());
        if (dto.getSpecification() != null) product.setSpecification(dto.getSpecification());
        if (dto.getUnitPrice() != null) product.setUnitPrice(dto.getUnitPrice());
        if (dto.getCostPrice() != null) product.setCostPrice(dto.getCostPrice());
        if (dto.getMaxStock() != null) product.setMaxStock(dto.getMaxStock());
        if (dto.getMinStockAlert() != null) product.setMinStockAlert(dto.getMinStockAlert());
        if (dto.getImageUrl() != null) product.setImageUrl(dto.getImageUrl());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getSortOrder() != null) product.setSortOrder(dto.getSortOrder());

        product.setStatus(calculateStatus(product.getStock(), product.getMaxStock()));
        updateById(product);
    }

    @Override
    public void deleteProduct(Long id) {
        if (getById(id) == null) {
            throw new BusinessException("产品不存在");
        }
        removeById(id);
    }

    @Override
    public void adjustStock(Long id, String changeType, Integer quantity, String remark) {
        Product product = getById(id);
        if (product == null) {
            throw new BusinessException("产品不存在");
        }
        if (quantity <= 0) {
            throw new BusinessException("数量必须大于0");
        }

        int newStock;
        switch (changeType) {
            case "IN" -> newStock = product.getStock() + quantity;
            case "OUT" -> {
                if (product.getStock() < quantity) {
                    throw new BusinessException("库存不足");
                }
                newStock = product.getStock() - quantity;
            }
            case "ADJUST" -> newStock = quantity;
            default -> throw new BusinessException("无效的变动类型");
        }

        product.setStock(newStock);
        product.setStatus(calculateStatus(newStock, product.getMaxStock()));
        updateById(product);
    }

    private String calculateStatus(int stock, int maxStock) {
        if (stock <= 0) return "OUT_OF_STOCK";
        if (stock <= maxStock * 0.2) return "LOW_STOCK";
        return "IN_STOCK";
    }

    private ProductVO toVO(Product product) {
        ProductVO vo = new ProductVO();
        BeanUtils.copyProperties(product, vo);
        return vo;
    }
}
