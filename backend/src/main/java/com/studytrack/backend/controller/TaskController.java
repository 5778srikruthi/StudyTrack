
package com.studytrack.backend.controller;

import com.studytrack.model.Task;
import com.studytrack.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {
    "http://127.0.0.1:5500",
    "http://localhost:5500"
})
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public Task addTask(
            @RequestParam Long userId,
            @RequestBody Task task) {
        return taskService.addTask(userId, task);
    }

    @GetMapping
    public List<Task> getAllTasks(@RequestParam Long userId) {
        return taskService.getAllTasks(userId);
    }

    @PutMapping("/{id}")
    public Task updateTask(
            @RequestParam Long userId,
            @PathVariable Long id,
            @RequestBody Task task) {
        return taskService.updateTask(userId, id, task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @RequestParam Long userId,
            @PathVariable Long id) {

        boolean deleted = taskService.deleteTask(userId, id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }
}
