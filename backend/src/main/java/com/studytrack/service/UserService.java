package com.studytrack.backend.service;

import com.studytrack.backend.model.User;
import com.studytrack.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {

        String hashedPassword =
                passwordEncoder.encode(user.getPassword());

        user.setPassword(hashedPassword);

        return userRepository.save(user);
    }

    public boolean loginUser(String email, String password) {

        User user = userRepository.findByEmail(email);

        if (user == null) {
            return false;
        }

        return passwordEncoder.matches(
                password,
                user.getPassword()
        );
    }
}