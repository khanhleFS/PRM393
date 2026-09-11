package com.fpt.sba301_su26_groupproject.service;

import com.fpt.sba301_su26_groupproject.dto.author.AuthorDashboardDTO;
import com.fpt.sba301_su26_groupproject.dto.author.AuthorProfileRequestDTO;
import com.fpt.sba301_su26_groupproject.dto.author.AuthorProfileResponseDTO;
import com.fpt.sba301_su26_groupproject.dto.author.CreateAuthorRequestDTO;

import java.util.List;

public interface AuthorProfileService {
    AuthorProfileResponseDTO createAuthorAccountByAdmin(CreateAuthorRequestDTO requestDTO);
    AuthorProfileResponseDTO getMyAuthorProfile(String userEmail);
    AuthorProfileResponseDTO updateMyAuthorProfile(AuthorProfileRequestDTO requestDTO, String userEmail);
    List<AuthorProfileResponseDTO> getAllAuthorProfiles();
    AuthorDashboardDTO getAuthorDashboard(String userEmail);
}
