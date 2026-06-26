package com.waterstation.ai.service;

import java.util.Map;

/**
 * 数据导入导出服务
 */
public interface DataService {

    /**
     * 导出全量数据为 JSON Map
     */
    Map<String, Object> exportAllData();

    /**
     * 导入数据（全量覆盖）
     */
    void importAllData(Map<String, Object> data);

    /**
     * 获取数据目录路径
     */
    String getDataDirectory();

    /**
     * 按日期自动备份当日数据快照
     */
    String backupToday();
}
