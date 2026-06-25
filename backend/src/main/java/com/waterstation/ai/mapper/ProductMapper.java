package com.waterstation.ai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.waterstation.ai.entity.Product;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductMapper extends BaseMapper<Product> {
}
