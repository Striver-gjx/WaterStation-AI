package com.waterstation.ai.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterstation.ai.common.exception.GlobalExceptionHandler;
import com.waterstation.ai.service.DataService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DataController.class)
@Import(GlobalExceptionHandler.class)
@DisplayName("数据导入导出API接口测试")
class DataControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DataService dataService;

    @Test
    @DisplayName("GET /api/v1/data/export - 导出全量数据")
    void exportData_returns200WithData() throws Exception {
        Map<String, Object> mockData = new LinkedHashMap<>();
        mockData.put("customers", List.of());
        mockData.put("products", List.of());

        when(dataService.exportAllData()).thenReturn(mockData);

        mockMvc.perform(get("/api/v1/data/export"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.customers").isArray())
                .andExpect(jsonPath("$.data.products").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/data/import - 导入数据")
    void importData_validJson_returns200() throws Exception {
        Map<String, Object> importData = new LinkedHashMap<>();
        importData.put("customers", List.of());

        mockMvc.perform(post("/api/v1/data/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(importData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.message").value("数据导入成功"));

        verify(dataService).importAllData(any());
    }

    @Test
    @DisplayName("POST /api/v1/data/import/file - 文件上传导入")
    void importFromFile_validFile_returns200() throws Exception {
        String jsonContent = "{\"customers\":[],\"products\":[]}";
        MockMultipartFile file = new MockMultipartFile(
                "file", "backup.json",
                MediaType.APPLICATION_JSON_VALUE,
                jsonContent.getBytes());

        mockMvc.perform(multipart("/api/v1/data/import/file").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.message").value("数据导入成功"))
                .andExpect(jsonPath("$.data.fileName").value("backup.json"));

        verify(dataService).importAllData(any());
    }

    @Test
    @DisplayName("POST /api/v1/data/backup - 手动备份")
    void backup_returns200WithPath() throws Exception {
        when(dataService.backupToday()).thenReturn("/data/backups/2026-06-29/backup.json");

        mockMvc.perform(post("/api/v1/data/backup"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.message").value("备份成功"))
                .andExpect(jsonPath("$.data.path").value("/data/backups/2026-06-29/backup.json"));
    }

    @Test
    @DisplayName("GET /api/v1/data/directory - 获取数据目录信息")
    void getDirectory_returns200WithInfo() throws Exception {
        when(dataService.getDataDirectory()).thenReturn("./target/test-data");

        mockMvc.perform(get("/api/v1/data/directory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.dataDirectory").value("./target/test-data"));
    }

    @Test
    @DisplayName("GET /api/v1/data/backup/{date} - 按日期查询备份")
    void getBackupsByDate_returns200() throws Exception {
        when(dataService.getDataDirectory()).thenReturn("./target/test-data");

        mockMvc.perform(get("/api/v1/data/backup/2026-06-29"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.date").value("2026-06-29"));
    }
}
