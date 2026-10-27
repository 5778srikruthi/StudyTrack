
package com.studytrack.backend.controller;

import com.studytrack.model.User;
import com.studytrack.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Registration successful! You can now log in.",
                "userId", registeredUser.getId()
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "message", e.getMessage()
            ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        User loggedInUser = userService.loginUser(
            user.getEmail(),
            user.getPassword()
        );

        if (loggedInUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid email or password"));
        }

        return ResponseEntity.ok(Map.of(
            "message", "Login successful!",
            "userId", loggedInUser.getId(),
            "name", loggedInUser.getName()
        ));
    }
}
