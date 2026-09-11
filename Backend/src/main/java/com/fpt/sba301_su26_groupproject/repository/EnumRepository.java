package com.fpt.sba301_su26_groupproject.repository;

import com.fpt.sba301_su26_groupproject.dto.enumeration.EnumResponseDTO;
import com.fpt.sba301_su26_groupproject.entity.Enumeration.*;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;

@Repository
public class EnumRepository {

    public List<EnumResponseDTO> getNovelEnums() {
        return List.of(
                new EnumResponseDTO("NovelStatus", Arrays.stream(NovelStatus.values()).map(Enum::name).toList()),
                new EnumResponseDTO("ChapterRange", List.of("5", "10", "20", "50", "100"))
        );
    }

    public List<EnumResponseDTO> getChapterEnums() {
        return List.of(
                new EnumResponseDTO("ChapterStatus", Arrays.stream(ChapterStatus.values()).map(Enum::name).toList())
        );
    }

    public List<EnumResponseDTO> getPaymentEnums() {
        return List.of(
                new EnumResponseDTO("PaymentStatus", Arrays.stream(PaymentStatus.values()).map(Enum::name).toList()),
                new EnumResponseDTO("PaymentMethod", Arrays.stream(PaymentMethod.values()).map(Enum::name).toList())
        );
    }

    public List<EnumResponseDTO> getCoinEnums() {
        return List.of(
                new EnumResponseDTO("CoinTransactionType", Arrays.stream(CoinTransactionType.values()).map(Enum::name).toList())
        );
    }

    public List<EnumResponseDTO> getAuthEnums() {
        return List.of(
                new EnumResponseDTO("UserRole", Arrays.stream(UserRole.values()).map(Enum::name).toList())
        );
    }
}
