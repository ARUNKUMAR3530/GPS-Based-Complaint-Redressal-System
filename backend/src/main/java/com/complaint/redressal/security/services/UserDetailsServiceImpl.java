package com.complaint.redressal.security.services;

import com.complaint.redressal.model.Admin;
import com.complaint.redressal.model.User;
import com.complaint.redressal.repository.AdminRepository;
import com.complaint.redressal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Autowired
    AdminRepository adminRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try to find User
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent()) {
            return UserDetailsImpl.build(user.get());
        }

        // Try to find Admin
        Optional<Admin> admin = adminRepository.findByUsername(username);
        if (admin.isPresent()) {
            return UserDetailsImpl.build(admin.get());
        }

        throw new UsernameNotFoundException("User Not Found with username: " + username);
    }
}
