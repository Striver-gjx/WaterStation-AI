package com.waterstation.ai.controller;

import com.waterstation.ai.common.result.Result;
import com.waterstation.ai.service.DataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import java.io.File;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/data")
@RequiredArgsConstructor
public class DataController {

    private final DataService dataService;
    private final ObjectMapper objectMapper;

    /**
     * 导出全量数据
     */
    @GetMapping("/export")
    public Result<Map<String, Object>> exportData() {
        Map<String, Object> data = dataService.exportAllData();
        return Result.success(data);
    }

    /**
     * 导入数据（JSON body）
     */
    @PostMapping("/import")
    public Result<Map<String, Object>> importData(@RequestBody Map<String, Object> data) {
        dataService.importAllData(data);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("message", "数据导入成功");
        result.put("importTime", java.time.LocalDateTime.now().toString());
        return Result.success(result);
    }

    /**
     * 导入数据（文件上传方式）
     */
    @PostMapping("/import/file")
    public Result<Map<String, Object>> importFromFile(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> data = objectMapper.readValue(
                    file.getInputStream(),
                    new TypeReference<Map<String, Object>>() {}
            );
            dataService.importAllData(data);
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("message", "数据导入成功");
            result.put("fileName", file.getOriginalFilename());
            result.put("importTime", java.time.LocalDateTime.now().toString());
            return Result.success(result);
        } catch (Exception e) {
            log.error("文件导入失败", e);
            return Result.error("文件解析失败: " + e.getMessage());
        }
    }

    /**
     * 手动备份
     */
    @PostMapping("/backup")
    public Result<Map<String, String>> backup() {
        String path = dataService.backupToday();
        Map<String, String> result = new LinkedHashMap<>();
        result.put("message", "备份成功");
        result.put("path", path);
        return Result.success(result);
    }

    /**
     * 获取数据目录信息
     */
    @GetMapping("/directory")
    public Result<Map<String, Object>> getDirectory() {
        String dir = dataService.getDataDirectory();
        File dataDir = new File(dir);
        File backupDir = new File(dataDir, "backups");

        Map<String, Object> info = new LinkedHashMap<>();
        info.put("dataDirectory", dir);
        info.put("backupDirectory", backupDir.getAbsolutePath());
        info.put("exists", dataDir.exists());

        if (backupDir.exists()) {
            String[] dates = backupDir.list();
            info.put("backupDates", dates != null ? dates : new String[0]);
        } else {
            info.put("backupDates", new String[0]);
        }

        return Result.success(info);
    }

    /**
     * 获取指定日期的备份列表
     */
    @GetMapping("/backup/{date}")
    public Result<Map<String, Object>> getBackupsByDate(@PathVariable String date) {
        String dir = dataService.getDataDirectory();
        File dateDir = new File(dir, "backups/" + date);

        Map<String, Object> info = new LinkedHashMap<>();
        info.put("date", date);

        if (dateDir.exists() && dateDir.isDirectory()) {
            String[] files = dateDir.list((d, name) -> name.endsWith(".json"));
            info.put("files", files != null ? files : new String[0]);
        } else {
            info.put("files", new String[0]);
        }

        return Result.success(info);
    }
}
