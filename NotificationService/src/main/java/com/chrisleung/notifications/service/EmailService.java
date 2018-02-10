package com.chrisleung.notifications.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.simplejavamail.email.Email;
import org.simplejavamail.email.EmailBuilder;
import org.simplejavamail.mailer.Mailer;
import org.simplejavamail.mailer.MailerBuilder;
import org.simplejavamail.mailer.config.TransportStrategy;

import com.chrisleung.notifications.objects.Notification;
import com.shopify.api.Product;
import com.shopify.api.Variant;

public class EmailService extends Thread {
    
    private Mailer api;
    private String bodyTemplate;
    private String subjectTemplate;
    private String shopName;
    private String shopDomain;
    private String senderName;
    private String senderAddress;
    private boolean logVerbose;
    
    EmailService(ApplicationProperties.Email emailProps, boolean lv) throws IOException {
        api = MailerBuilder
                .withSMTPServer(
                        emailProps.getSmtp().getAddress(),
                        emailProps.getSmtp().getPort(),
                        emailProps.getSmtp().getUsername(),
                        emailProps.getSmtp().getPassword())
                .withTransportStrategy(TransportStrategy.SMTPS)
                .buildMailer();
        bodyTemplate = new String(Files.readAllBytes(Paths.get(emailProps.getTemplate().getPath())));
        subjectTemplate = emailProps.getSubject().getTemplate();
        shopName = emailProps.getShop().getName();
        shopDomain = emailProps.getShop().getDomain();
        senderName = emailProps.getSender().getName();
        senderAddress = emailProps.getSender().getAddress();
        logVerbose = lv;
    }
    
    private boolean sendEmailNotification(Notification n, Product p, Variant v) {
        
        String imageUrl = p.getImages()[0].getSrc();
        String emailImageUrl = imageUrl.substring(0, imageUrl.indexOf(".jpg")) + "_560x.jpg"; // TODO: Size should be property
        String emailSubject = subjectTemplate
                                .replace("{{shop.name}}", shopName)
                                .replace("{{product.title}}", p.getTitle());
        
        String emailBody = bodyTemplate
                                .replace("{{shop.domain}}", shopDomain)
                                .replace("{{product.handle}}", p.getHandle())
                                .replace("{{product.title}}", p.getTitle())
                                .replace("{{variant.title}}", v.getTitle())
                                .replace("{{shop.name}}", shopName)
                                .replace("{{product.image}}", emailImageUrl);
                                
        Email email = EmailBuilder.startingBlank()
                        .to(n.getEmail())
                        .from(senderName, senderAddress)
                        .withSubject(emailSubject)
                        .withHTMLText(emailBody)
                        .buildEmail();
        
        boolean success = false;
        if(!api.validate(email)) return false;
        try {
            api.sendMail(email);
            success = true;
        } catch(Exception e) {
            if(logVerbose) e.printStackTrace();
        }
        return success;
    }
}