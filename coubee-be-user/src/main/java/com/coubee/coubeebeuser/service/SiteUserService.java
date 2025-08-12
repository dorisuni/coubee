package com.coubee.coubeebeuser.service;

import com.coubee.coubeebeuser.common.exception.BadParameter;
import com.coubee.coubeebeuser.common.exception.NotFound;
import com.coubee.coubeebeuser.common.type.ActionAndId;
import com.coubee.coubeebeuser.domain.CoubeeUser;
import com.coubee.coubeebeuser.domain.CoubeeUserInfo;
import com.coubee.coubeebeuser.domain.NotificationToken;
import com.coubee.coubeebeuser.domain.dto.*;
import com.coubee.coubeebeuser.domain.event.SiteUserInfoEvent;
import com.coubee.coubeebeuser.domain.repository.CoubeeUserInfoRepository;
import com.coubee.coubeebeuser.domain.repository.NotificationTokenRepository;
import com.coubee.coubeebeuser.domain.repository.SiteUserRepository;
import com.coubee.coubeebeuser.event.producer.KafkaMessageProducer;
import com.coubee.coubeebeuser.secret.hash.SecureHashUtils;
import com.coubee.coubeebeuser.secret.jwt.TokenGenerator;
import com.coubee.coubeebeuser.secret.jwt.dto.TokenDto;
import com.coubee.coubeebeuser.util.FileUploader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SiteUserService {
    private final SiteUserRepository siteUserRepository;
    private final TokenGenerator tokenGenerator;
    private final KafkaMessageProducer kafkaMessageProducer;
    private final CoubeeUserInfoRepository coubeeUserInfoRepository;
    private final FileUploader fileUploader;
    private final NotificationTokenRepository notificationTokenRepository;

    @Transactional
    public ActionAndId registerUserAndNotify(SiteUserRegisterDto registerDto) {
        CoubeeUser coubeeUser = registerDto.toEntity();
        Optional<CoubeeUser> existedUsername = siteUserRepository.findByUsername(coubeeUser.getUsername());
        Optional<CoubeeUser> existedNickName = siteUserRepository.findByNickname(coubeeUser.getNickname());
        if(existedUsername.isPresent()){
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

//    @Transactional(readOnly = true)
//    public TokenDto.AccessRefreshToken login(SiteUserLoginDto loginDto) {
//        CoubeeUser user = siteUserRepository.findByUsername(loginDto.getUsername())
//                .orElseThrow(() -> new NotFound("아이디 또는 비밀번호를 확인하세요."));
//        if (!SecureHashUtils.matches(loginDto.getPassword(), user.getPassword())) {
//            throw new BadParameter("아이디 또는 비밀번호를 확인하세요.");
//        }
//        return tokenGenerator.generateAccessRefreshToken(user, "WEB");
//    }

    @Transactional(readOnly = true)
    public SiteUserLoginResponseDto login(SiteUserLoginDto loginDto) {
        CoubeeUser user = siteUserRepository.findByUsername(loginDto.getUsername())
                .orElseThrow(() -> new NotFound("아이디 또는 비밀번호를 확인하세요."));
        if (!SecureHashUtils.matches(loginDto.getPassword(), user.getPassword())) {
            throw new BadParameter("아이디 또는 비밀번호를 확인하세요.");
        }
        CoubeeUserInfo coubeeUserInfo = coubeeUserInfoRepository.findByUserId(user.getUserId()).orElse(null);

        SiteUserLoginResponseDto loginResponseDto = new SiteUserLoginResponseDto();

        loginResponseDto.setAccessRefreshToken(tokenGenerator.generateAccessRefreshToken(user, "WEB"));
        loginResponseDto.setUserInfo(SiteUserInfoDto.fromEntity(user,coubeeUserInfo));

        return loginResponseDto;
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
    @Transactional
    public SiteUserInfoDto registerUserInfo(Long userId,SiteUserInfoRegisterDto dto){
        CoubeeUser targetUser = siteUserRepository.findById(userId).orElseThrow(()->
                new NotFound("사용자를 찾을 수 없습니다."));
        CoubeeUserInfo newInfo = CoubeeUserInfo.builder()
                .userId(userId)
                .name(dto.getName())
                .email(dto.getEmail())
                .age(dto.getAge())
                .gender(dto.getGender())
                .phoneNum(dto.getPhoneNum())
                .profileImageUrl(dto.getProfileImageUrl())
                .build();
        CoubeeUserInfo saved = coubeeUserInfoRepository.save(newInfo);

        return SiteUserInfoDto.fromEntity(targetUser,saved);
    }

    @Transactional(readOnly = true)
    public SiteUserInfoDto userInfo(String username) {
        CoubeeUser user = siteUserRepository.findByUsername(username)
                .orElseThrow(() -> new NotFound("사용자를 찾을 수 없습니다."));
        CoubeeUserInfo coubeeUserInfo = coubeeUserInfoRepository.findByUserId(user.getUserId()).orElse(null);
        return SiteUserInfoDto.fromEntity(user,coubeeUserInfo);
    }

    public String uploadProfile(MultipartFile file) {
        String profileImageUrl = fileUploader.upload(file,"user/profile");
        return profileImageUrl;
    }


    public void saveNotificationToken(String username, NotificationTokenDto dto){
        Optional<NotificationToken> existToken = notificationTokenRepository.findByToken(dto.getNotificationToken());
        CoubeeUser user = siteUserRepository.findByUsername(username).orElseThrow(()->new NotFound("유저 없음"));
        if(existToken.isPresent()){
            if(user.getUsername().equals(username)){
                log.info("기존 거 있음");
            }else{
                notificationTokenRepository.delete(existToken.get());
                notificationTokenRepository.flush();
                log.info("기존거 삭제");
                NotificationToken notificationToken = NotificationToken.builder()
                        .user(user).token(dto.getNotificationToken()).build();
                notificationTokenRepository.save(notificationToken);
                log.info("새 토큰 저장");
            }
        }else{
            NotificationToken notificationToken = NotificationToken.builder()
                    .user(user).token(dto.getNotificationToken()).build();
            notificationTokenRepository.save(notificationToken);
            log.info("새 토큰 저장");
        }
    }
    public void deleteNotificationToken(NotificationTokenDto dto){
        Optional<NotificationToken> existToken = notificationTokenRepository.findByToken(dto.getNotificationToken());
        existToken.ifPresent(notificationTokenRepository::delete);
        log.info("noti 토큰 삭제");
    }

    public List<String> getNotificationTokenListByUserId(Long userId){
        List<NotificationToken> list = notificationTokenRepository.findAllByUser_UserId(userId);
        return list.stream()
                .map(NotificationToken::getToken)
                .toList();
    }
}
