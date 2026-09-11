package com.fpt.sba301_su26_groupproject.service;


import com.fpt.sba301_su26_groupproject.dto.enumeration.EnumResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.coin.*;

import java.util.List;
import java.util.UUID;

public interface CoinPackageService {

    List<CoinCreateResponseDTO> getActivePackages();

    List<CoinCreateResponseDTO> getAllPackages();

    CoinCreateResponseDTO createPackage(CoinCreateRequestDTO request);

    CoinCreateResponseDTO updatePackage(UUID id, CoinCreateRequestDTO request);

    CoinCreateResponseDTO togglePackageStatus(UUID id);

    void deletePackage(UUID id);

    List<EnumResponseDTO> getEnums();
}
