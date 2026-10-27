package com.studytrack.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.studytrack.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    List<User> findAllByEmail(String email);

    boolean existsByEmail(String email);
}
