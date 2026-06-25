package com.waterstation.ai.common.result;

import lombok.Data;
import java.util.List;

@Data
public class PageResult<T> {
    private long total;
    private List<T> list;

    public static <T> PageResult<T> of(long total, List<T> list) {
        PageResult<T> pageResult = new PageResult<>();
        pageResult.setTotal(total);
        pageResult.setList(list);
        return pageResult;
    }
}
