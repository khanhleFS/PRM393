package com.fpt.sba301_su26_groupproject.common.security;

import com.fpt.sba301_su26_groupproject.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class UserDetailService implements UserDetailsService {

    private final UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
             return userRepository.findByEmail(email)
                     .map(CustomUserDetail::new)
                     .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}
