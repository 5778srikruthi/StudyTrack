
package com.studytrack.service;

import com.studytrack.model.Task;
import com.studytrack.model.User;
import com.studytrack.repository.TaskRepository;
import com.studytrack.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository,
                       UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public Task addTask(Long userId, Task task) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        if (task.getFolderName() == null
                || task.getFolderName().isBlank()) {
            task.setFolderName("Uncategorized");
        }

        task.setUser(user);
        return taskRepository.save(task);
    }

    public List<Task> getAllTasks(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        return taskRepository.findByUser(user);
    }

    public Task updateTask(Long userId, Long id, Task updatedTask) {
        Task existingTask = taskRepository.findById(id).orElse(null);

        if (existingTask == null
                || existingTask.getUser() == null
                || !existingTask.getUser().getId().equals(userId)) {
            return null;
        }

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setCompleted(updatedTask.isCompleted());
        existingTask.setDueDate(updatedTask.getDueDate());
        existingTask.setPriority(updatedTask.getPriority());

        if (updatedTask.getFolderName() != null
                && !updatedTask.getFolderName().isBlank()) {
            existingTask.setFolderName(updatedTask.getFolderName());
        }

        return taskRepository.save(existingTask);
    }

    public boolean deleteTask(Long userId, Long id) {
        Task existingTask = taskRepository.findById(id).orElse(null);

        if (existingTask == null
                || existingTask.getUser() == null
                || !existingTask.getUser().getId().equals(userId)) {
            return false;
        }

        taskRepository.delete(existingTask);
        return true;
    }
}
