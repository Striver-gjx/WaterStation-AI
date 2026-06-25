package com.waterstation.ai.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.waterstation.ai.dto.ProductCreateDTO;
import com.waterstation.ai.dto.ProductUpdateDTO;
import com.waterstation.ai.entity.Product;
import com.waterstation.ai.vo.ProductVO;
import java.util.List;

public interface ProductService extends IService<Product> {
    List<ProductVO> listProducts(String category, String status);
    ProductVO getProductById(Long id);
    ProductVO createProduct(ProductCreateDTO dto);
    void updateProduct(Long id, ProductUpdateDTO dto);
    void deleteProduct(Long id);
    void adjustStock(Long id, String changeType, Integer quantity, String remark);
}
