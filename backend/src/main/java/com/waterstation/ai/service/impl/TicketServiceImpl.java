package com.waterstation.ai.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.waterstation.ai.common.exception.BusinessException;
import com.waterstation.ai.common.result.PageResult;
import com.waterstation.ai.dto.TicketRedeemDTO;
import com.waterstation.ai.dto.TicketSellDTO;
import com.waterstation.ai.entity.Customer;
import com.waterstation.ai.entity.Product;
import com.waterstation.ai.entity.TicketPackage;
import com.waterstation.ai.entity.TicketRedemption;
import com.waterstation.ai.mapper.CustomerMapper;
import com.waterstation.ai.mapper.ProductMapper;
import com.waterstation.ai.mapper.TicketPackageMapper;
import com.waterstation.ai.mapper.TicketRedemptionMapper;
import com.waterstation.ai.service.TicketService;
import com.waterstation.ai.vo.TicketPackageVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl extends ServiceImpl<TicketPackageMapper, TicketPackage> implements TicketService {

    private final TicketRedemptionMapper redemptionMapper;
    private final CustomerMapper customerMapper;
    private final ProductMapper productMapper;

    @Override
    public PageResult<TicketPackageVO> listPackages(Long customerId, String status, Integer page, Integer size) {
        LambdaQueryWrapper<TicketPackage> wrapper = new LambdaQueryWrapper<>();
        if (customerId != null) {
            wrapper.eq(TicketPackage::getCustomerId, customerId);
        }
        if (StringUtils.hasText(status)) {
            wrapper.eq(TicketPackage::getStatus, status);
        }
        wrapper.orderByDesc(TicketPackage::getCreatedAt);

        Page<TicketPackage> pageResult = page(new Page<>(page, size), wrapper);
        List<TicketPackageVO> voList = pageResult.getRecords().stream()
                .map(this::toVO).toList();
        return PageResult.of(pageResult.getTotal(), voList);
    }

    @Override
    public TicketPackageVO getPackageById(Long id) {
        TicketPackage pkg = getById(id);
        if (pkg == null) {
            throw new BusinessException("水票套餐不存在");
        }
        return toVO(pkg);
    }

    @Override
    @Transactional
    public TicketPackageVO sellPackage(TicketSellDTO dto) {
        Customer customer = customerMapper.selectById(dto.getCustomerId());
        if (customer == null) {
            throw new BusinessException("客户不存在");
        }
        Product product = productMapper.selectById(dto.getProductId());
        if (product == null) {
            throw new BusinessException("产品不存在");
        }

        TicketPackage pkg = new TicketPackage();
        pkg.setCustomerId(dto.getCustomerId());
        pkg.setProductId(dto.getProductId());
        pkg.setTotalTickets(dto.getTotalTickets());
        pkg.setRemainingTickets(dto.getTotalTickets());
        pkg.setPricePaid(dto.getPricePaid());
        pkg.setUnitPrice(dto.getPricePaid().divide(BigDecimal.valueOf(dto.getTotalTickets()), 2, RoundingMode.HALF_UP));
        pkg.setStatus("ACTIVE");
        pkg.setPurchaseDate(LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE));

        int expireDays = dto.getExpireDays() != null ? dto.getExpireDays() : 365;
        pkg.setExpireDate(LocalDate.now().plusDays(expireDays).format(DateTimeFormatter.ISO_LOCAL_DATE));
        save(pkg);

        customer.setActiveTickets(customer.getActiveTickets() + dto.getTotalTickets());
        customer.setTotalSpent(customer.getTotalSpent().add(dto.getPricePaid()));
        customer.setLifetimeOrders(customer.getLifetimeOrders() + 1);
        customerMapper.updateById(customer);

        return toVO(pkg);
    }

    @Override
    @Transactional
    public void redeemTickets(TicketRedeemDTO dto) {
        TicketPackage pkg = getById(dto.getPackageId());
        if (pkg == null) {
            throw new BusinessException("水票套餐不存在");
        }
        if (!"ACTIVE".equals(pkg.getStatus())) {
            throw new BusinessException("该套餐已失效");
        }
        if (pkg.getRemainingTickets() < dto.getRedeemedQty()) {
            throw new BusinessException("剩余水票不足");
        }

        pkg.setRemainingTickets(pkg.getRemainingTickets() - dto.getRedeemedQty());
        if (pkg.getRemainingTickets() <= 0) {
            pkg.setStatus("DEPLETED");
        }
        updateById(pkg);

        TicketRedemption redemption = new TicketRedemption();
        redemption.setPackageId(dto.getPackageId());
        redemption.setCustomerId(pkg.getCustomerId());
        redemption.setRedeemedQty(dto.getRedeemedQty());
        redemption.setRedemptionDate(LocalDateTime.now());
        redemption.setRemark(dto.getRemark());
        redemptionMapper.insert(redemption);

        Customer customer = customerMapper.selectById(pkg.getCustomerId());
        if (customer != null) {
            customer.setActiveTickets(Math.max(0, customer.getActiveTickets() - dto.getRedeemedQty()));
            customerMapper.updateById(customer);
        }
    }

    private TicketPackageVO toVO(TicketPackage pkg) {
        TicketPackageVO vo = new TicketPackageVO();
        vo.setId(pkg.getId());
        vo.setCustomerId(pkg.getCustomerId());
        vo.setProductId(pkg.getProductId());
        vo.setTotalTickets(pkg.getTotalTickets());
        vo.setRemainingTickets(pkg.getRemainingTickets());
        vo.setPricePaid(pkg.getPricePaid());
        vo.setUnitPrice(pkg.getUnitPrice());
        vo.setStatus(pkg.getStatus());
        vo.setPurchaseDate(pkg.getPurchaseDate());
        vo.setExpireDate(pkg.getExpireDate());

        Customer customer = customerMapper.selectById(pkg.getCustomerId());
        if (customer != null) vo.setCustomerName(customer.getName());
        Product product = productMapper.selectById(pkg.getProductId());
        if (product != null) vo.setProductName(product.getName());
        return vo;
    }
}
