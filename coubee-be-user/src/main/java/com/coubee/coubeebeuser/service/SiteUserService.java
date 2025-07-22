package com.coubee.coubeebeuser.service;

import com.coubee.coubeebeuser.common.exception.BadParameter;
import com.coubee.coubeebeuser.common.exception.NotFound;
import com.coubee.coubeebeuser.common.type.ActionAndId;
import com.coubee.coubeebeuser.domain.CoubeeUser;
import com.coubee.coubeebeuser.domain.dto.SiteUserInfoDto;
import com.coubee.coubeebeuser.domain.dto.SiteUserLoginDto;
import com.coubee.coubeebeuser.domain.dto.SiteUserRefreshDto;
import com.coubee.coubeebeuser.domain.dto.SiteUserRegisterDto;
import com.coubee.coubeebeuser.domain.event.SiteUserInfoEvent;
import com.coubee.coubeebeuser.domain.repository.SiteUserRepository;
import com.coubee.coubeebeuser.event.producer.KafkaMessageProducer;
import com.coubee.coubeebeuser.secret.hash.SecureHashUtils;
import com.coubee.coubeebeuser.secret.jwt.TokenGenerator;
import com.coubee.coubeebeuser.secret.jwt.dto.TokenDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SiteUserService {
    private final SiteUserRepository siteUserRepository;
    private final TokenGenerator tokenGenerator;
    private final KafkaMessageProducer kafkaMessageProducer;

    @Transactional
    public ActionAndId registerUserAndNotify(SiteUserRegisterDto registerDto) {
        CoubeeUser coubeeUser = registerDto.toEntity();
        Optional<CoubeeUser> existedUsename = siteUserRepository.findByUsername(coubeeUser.getUsername());
        Optional<CoubeeUser> existedNickName = siteUserRepository.findByNickname(coubeeUser.getNickname());
        if(existedUsename.isPresent()){
            throw new BadParameter("사용하고 있는 아이디입니다");
        }
        if(existedNickName.isPresent()){
            throw new BadParameter("사용하고 있는 닉네임입니다");
        }
        siteUserRepository.save(coubeeUser);
        SiteUserInfoEvent event = SiteUserInfoEvent.fromEntity("Create", coubeeUser);
        kafkaMessageProducer.send(SiteUserInfoEvent.Topic, event);
        return ActionAndId.of("Create", coubeeUser.getUserId());
    }

    @Transactional
    public ActionAndId updateEmailAndNotify() {
        return ActionAndId.of("Update", 0L);
    }

    @Transactional
    public ActionAndId updateAddressAndNotify() {
        return ActionAndId.of("Update", 0L);
    }

    @Transactional(readOnly = true)
    public TokenDto.AccessRefreshToken login(SiteUserLoginDto loginDto) {
        CoubeeUser user = siteUserRepository.findByUsername(loginDto.getUsername())
                .orElseThrow(() -> new NotFound("아이디 또는 비밀번호를 확인하세요."));
        if (!SecureHashUtils.matches(loginDto.getPassword(), user.getPassword())) {
            throw new BadParameter("아이디 또는 비밀번호를 확인하세요.");
        }
        return tokenGenerator.generateAccessRefreshToken(user, "WEB");
    }

    @Transactional(readOnly = true)
    public TokenDto.AccessToken refresh(SiteUserRefreshDto refreshDto) {
        String username = tokenGenerator.validateJwtToken(refreshDto.getToken());
        if (username == null) {
            throw new BadParameter("토큰이 유효하지 않습니다.");
        }
        CoubeeUser user = siteUserRepository.findByUsername(username)
                .orElseThrow(() -> new NotFound("사용자를 찾을 수 없습니다."));
        return tokenGenerator.generateAccessToken(user, "WEB");
    }

    @Transactional(readOnly = true)
    public SiteUserInfoDto userInfo(String userId) {
        CoubeeUser user = siteUserRepository.findByUsername(userId)
                .orElseThrow(() -> new NotFound("사용자를 찾을 수 없습니다."));
        return SiteUserInfoDto.fromEntity(user);
    }
}
