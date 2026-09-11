package com.fpt.sba301_su26_groupproject.service;

import jakarta.mail.MessagingException;

import java.util.Map;

public interface MailService {
    void sendPlainText(String to, String subject, String body);
    void sendHtml(String to, String subject, String htmlBody) throws MessagingException;
    void sendWithTemplate(String to, String subject, String templateName, Map<String, Object> variables) throws  MessagingException;
}
