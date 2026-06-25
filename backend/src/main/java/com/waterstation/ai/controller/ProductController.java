package com.waterstation.ai.controller;

import com.waterstation.ai.common.result.Result;
import com.waterstation.ai.dto.ProductCreateDTO;
import com.waterstation.ai.dto.ProductUpdateDTO;
import com.waterstation.ai.service.ProductService;
import com.waterstation.ai.vo.ProductVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public Result<List<ProductVO>> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        return Result.success(productService.listProducts(category, status));
    }

    @GetMapping("/{id}")
    public Result<ProductVO> get(@PathVariable Long id) {
        return Result.success(productService.getProductById(id));
    }

    @PostMapping
    public Result<ProductVO> create(@Valid @RequestBody ProductCreateDTO dto) {
        return Result.success(productService.createProduct(dto));
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody ProductUpdateDTO dto) {
        productService.updateProduct(id, dto);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        productService.deleteProduct(id);
        return Result.success();
    }

    @PutMapping("/{id}/stock")
    public Result<Void> adjustStock(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String changeType = body.get("changeType").toString();
        Integer quantity = Integer.valueOf(body.get("quantity").toString());
        String remark = body.containsKey("remark") ? body.get("remark").toString() : null;
        productService.adjustStock(id, changeType, quantity, remark);
        return Result.success();
    }
}
