package com.waterstation.ai.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Transactional
@DisplayName("数据导入导出服务层集成测试")
class DataServiceTest {

    @Autowired
    private DataService dataService;

    @Test
    @DisplayName("导出全量数据 - 包含版本号和所有实体集合")
    void exportAllData_containsAllSections() {
        Map<String, Object> data = dataService.exportAllData();

        assertThat(data).containsKeys("version", "exportTime", "platform",
                "customers", "products", "drivers", "orders",
                "orderItems", "deliveries", "ticketPackages",
                "ticketRedemptions", "buckets");
        assertThat(data.get("version")).isEqualTo("1.0");
    }

    @Test
    @DisplayName("导出全量数据 - 包含初始化的演示数据")
    void exportAllData_containsInitData() {
        Map<String, Object> data = dataService.exportAllData();

        assertThat(data.get("products")).isNotNull();
    }

    @Test
    @DisplayName("获取数据目录 - 返回非空路径")
    void getDataDirectory_returnsNonEmptyPath() {
        String dir = dataService.getDataDirectory();

        assertThat(dir).isNotNull().isNotEmpty();
    }

    @Test
    @DisplayName("备份数据 - 返回备份文件路径")
    void backupToday_returnsFilePath() {
        String path = dataService.backupToday();

        assertThat(path).isNotNull();
        assertThat(path).contains("backups");
        assertThat(path).endsWith(".json");
    }

    @Test
    @DisplayName("导入数据 - 无效格式（缺少版本号）抛出异常")
    void importAllData_missingVersion_throwsException() {
        Map<String, Object> invalid = new LinkedHashMap<>();
        invalid.put("customers", null);

        assertThatThrownBy(() -> dataService.importAllData(invalid))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("无效的数据文件：缺少版本号");
    }

    @Test
    @DisplayName("导入数据 - 空数据集正常执行（不抛异常）")
    void importAllData_emptyCollections_succeeds() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("version", "1.0");
        data.put("exportTime", "2026-01-01T00:00:00");
        data.put("platform", "test");

        assertThatCode(() -> dataService.importAllData(data))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("导出-导入往返 - 通过JSON序列化模拟真实场景")
    void exportImportRoundTrip_viaJson_dataConsistency() throws Exception {
        Map<String, Object> exported = dataService.exportAllData();

        com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
        objectMapper.findAndRegisterModules();
        String json = objectMapper.writeValueAsString(exported);

        @SuppressWarnings("unchecked")
        Map<String, Object> deserialized = objectMapper.readValue(json, Map.class);

        dataService.importAllData(deserialized);

        Map<String, Object> reExported = dataService.exportAllData();
        assertThat(reExported.get("version")).isEqualTo(exported.get("version"));
    }
}
