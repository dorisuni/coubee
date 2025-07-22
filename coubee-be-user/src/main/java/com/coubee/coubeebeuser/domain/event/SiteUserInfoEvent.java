package com.coubee.coubeebeuser.domain.event;

import com.coubee.coubeebeuser.domain.CoubeeUser;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class SiteUserInfoEvent {
    public static final String Topic = "userinfo";

    private String action;

    private String username;

    private LocalDateTime eventTime;

    public static SiteUserInfoEvent fromEntity(String action, CoubeeUser coubeeUser) {
        SiteUserInfoEvent event = new SiteUserInfoEvent();
        event.action = action;
        event.username = coubeeUser.getUsername();
        event.eventTime = LocalDateTime.now();
        return event;
    }
}
