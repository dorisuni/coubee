package com.coubee.coubeebeuser.service.aop;

import com.coubee.coubeebeuser.common.type.ActionAndId;
import com.coubee.coubeebeuser.domain.CoubeeUser;
import com.coubee.coubeebeuser.domain.event.SiteUserInfoEvent;
import com.coubee.coubeebeuser.domain.repository.SiteUserRepository;
import com.coubee.coubeebeuser.event.producer.KafkaMessageProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class UserUpdateEventAop {
    private final SiteUserRepository siteUserRepository;
    private final KafkaMessageProducer kafkaMessageProducer;

    @AfterReturning(
            value = "execution(* com.coubee.coubeebeuser.service.SiteUserService.*AndNotify(..))",
            returning = "actionAndId"
    )
    public void publishUserUpdateEvent(JoinPoint joinPoint, ActionAndId actionAndId) {
        publishUserUpdateEvent(actionAndId);
    }

    private void publishUserUpdateEvent(ActionAndId actionAndId) {
        try {
            CoubeeUser siteUser = siteUserRepository.findById(actionAndId.getId())
                    .orElse(null);
            if (siteUser == null) {
                return;
            }

            SiteUserInfoEvent event = SiteUserInfoEvent.fromEntity(actionAndId.getAction(), siteUser);

            kafkaMessageProducer.send(SiteUserInfoEvent.Topic, event);
        } catch (Exception e) {
            log.warn("사용자 정보 업데이트 이벤트를 발행하지 못하였습니다. id={}", actionAndId.getId());
        }
    }
}
