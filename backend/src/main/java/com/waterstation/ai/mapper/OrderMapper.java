package com.waterstation.ai.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.waterstation.ai.entity.Order;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OrderMapper extends BaseMapper<Order> {
}
