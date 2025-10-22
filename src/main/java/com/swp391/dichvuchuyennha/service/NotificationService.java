package com.swp391.dichvuchuyennha.service;

import com.swp391.dichvuchuyennha.entity.Notification;
import com.swp391.dichvuchuyennha.entity.Users;
import com.swp391.dichvuchuyennha.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void createNotification(Users user, String title, String message, String type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setCreateAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }
}
