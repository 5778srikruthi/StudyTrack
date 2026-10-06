package com.studytrack.backend.controller;

import com.studytrack.backend.model.User;
import com.studytrack.backend.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:5500")
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {

        boolean success = userService.loginUser(
                user.getEmail(),
                user.getPassword()
        );

        if (success) {
            return "Login successful!";
        }

        return "Invalid email or password";
    }
}