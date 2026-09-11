package com.fpt.sba301_su26_groupproject.service;

import com.fpt.sba301_su26_groupproject.dto.profile.ProfileDTO;
import com.fpt.sba301_su26_groupproject.dto.profile.CoinTransactionResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ProfileService {

    ProfileDTO getProfile(UUID id);

    void updateProfile(UUID id, ProfileDTO profile);

    Page<CoinTransactionResponseDTO> getCoinTransactions(String userEmail, Pageable pageable);
}
