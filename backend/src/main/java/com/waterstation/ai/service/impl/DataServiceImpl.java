package com.waterstation.ai.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.waterstation.ai.entity.*;
import com.waterstation.ai.mapper.*;
import com.waterstation.ai.service.DataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataServiceImpl implements DataService {

    private final CustomerMapper customerMapper;
    private final ProductMapper productMapper;
    private final DriverMapper driverMapper;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;
    private final DeliveryMapper deliveryMapper;
    private final TicketPackageMapper ticketPackageMapper;
    private final TicketRedemptionMapper ticketRedemptionMapper;
    private final BucketMapper bucketMapper;
    private final ObjectMapper objectMapper;

    @Value("${app.data-dir:./data}")
    private String dataDir;

    private static final String EXPORT_VERSION = "1.0";
    private static final DateTimeFormatter DATE_DIR_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Override
    public Map<String, Object> exportAllData() {
        Map<String, Object> export = new LinkedHashMap<>();
        export.put("version", EXPORT_VERSION);
        export.put("exportTime", LocalDateTime.now().toString());
        export.put("platform", System.getProperty("os.name"));

        export.put("customers", customerMapper.selectList(null));
        export.put("products", productMapper.selectList(null));
        export.put("drivers", driverMapper.selectList(null));
        export.put("orders", orderMapper.selectList(null));
        export.put("orderItems", orderItemMapper.selectList(null));
        export.put("deliveries", deliveryMapper.selectList(null));
        export.put("ticketPackages", ticketPackageMapper.selectList(null));
        export.put("ticketRedemptions", ticketRedemptionMapper.selectList(null));
        export.put("buckets", bucketMapper.selectList(null));

        return export;
    }

    @Override
    @Transactional
    @SuppressWarnings("unchecked")
    public void importAllData(Map<String, Object> data) {
        String version = (String) data.get("version");
        if (version == null) {
            throw new IllegalArgumentException("无效的数据文件：缺少版本号");
        }

        log.info("开始导入数据，版本: {}, 导出时间: {}, 来源平台: {}",
                version, data.get("exportTime"), data.get("platform"));

        backupToday();

        clearAllTables();

        importEntities("customers", data, Customer.class, customerMapper);
        importEntities("products", data, Product.class, productMapper);
        importEntities("drivers", data, Driver.class, driverMapper);
        importEntities("orders", data, Order.class, orderMapper);
        importEntities("orderItems", data, OrderItem.class, orderItemMapper);
        importEntities("deliveries", data, Delivery.class, deliveryMapper);
        importEntities("ticketPackages", data, TicketPackage.class, ticketPackageMapper);
        importEntities("ticketRedemptions", data, TicketRedemption.class, ticketRedemptionMapper);
        importEntities("buckets", data, Bucket.class, bucketMapper);

        log.info("数据导入完成");
    }

    @Override
    public String getDataDirectory() {
        File dir = new File(dataDir);
        return dir.getAbsolutePath();
    }

    @Override
    public String backupToday() {
        String dateStr = LocalDate.now().format(DATE_DIR_FORMAT);
        File backupDir = new File(dataDir, "backups/" + dateStr);
        if (!backupDir.exists()) {
            backupDir.mkdirs();
        }

        Map<String, Object> snapshot = exportAllData();
        String filename = "backup_" + System.currentTimeMillis() + ".json";
        File backupFile = new File(backupDir, filename);

        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(backupFile, snapshot);
            log.info("数据备份完成: {}", backupFile.getAbsolutePath());
            return backupFile.getAbsolutePath();
        } catch (IOException e) {
            log.error("数据备份失败", e);
            throw new RuntimeException("数据备份失败: " + e.getMessage());
        }
    }

    private void clearAllTables() {
        ticketRedemptionMapper.delete(null);
        ticketPackageMapper.delete(null);
        bucketMapper.delete(null);
        deliveryMapper.delete(null);
        orderItemMapper.delete(null);
        orderMapper.delete(null);
        driverMapper.delete(null);
        productMapper.delete(null);
        customerMapper.delete(null);
    }

    @SuppressWarnings("unchecked")
    private <T> void importEntities(String key, Map<String, Object> data,
                                     Class<T> entityClass,
                                     com.baomidou.mybatisplus.core.mapper.BaseMapper<T> mapper) {
        Object raw = data.get(key);
        if (raw == null) {
            log.warn("导入数据中缺少 {} 字段，跳过", key);
            return;
        }

        List<Map<String, Object>> list;
        if (raw instanceof List) {
            list = (List<Map<String, Object>>) raw;
        } else {
            log.warn("{} 数据格式不正确，跳过", key);
            return;
        }

        int count = 0;
        for (Map<String, Object> item : list) {
            T entity = objectMapper.convertValue(item, entityClass);
            mapper.insert(entity);
            count++;
        }
        log.info("导入 {} : {} 条记录", key, count);
    }
}
