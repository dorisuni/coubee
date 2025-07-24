package com.coubee.coubeebeuser.api.open;

import com.coubee.coubeebeuser.common.dto.ApiResponseDto;
import com.coubee.coubeebeuser.common.web.context.GatewayRequestHeaderUtils;
import com.coubee.coubeebeuser.domain.dto.SiteUserInfoDto;
import com.coubee.coubeebeuser.domain.dto.SiteUserInfoRegisterDto;
import com.coubee.coubeebeuser.remote.alim.RemoteAlimService;
import com.coubee.coubeebeuser.service.SiteUserService;
import com.coubee.coubeebeuser.util.FileUploader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping(value = "/api/user", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class UserController {
    private final RemoteAlimService remoteAlimService;
    private final SiteUserService siteUserService;


//    @GetMapping(value = "/test")
//    public ApiResponseDto<String> test() {
//        String userId = GatewayRequestHeaderUtils.getUserIdOrThrowException();
//        log.error("userId = {}", userId);
//        return ApiResponseDto.createOk(userId);
//    }
//
//    @PostMapping(value = "/sms")
//    public ApiResponseDto<SendSmsDto.Response> sms(@RequestBody SendSmsDto.Request request) {
//        var result = remoteAlimService.sendSms(request);
//        return ApiResponseDto.createOk(result);
//    }
    @GetMapping(value="/info")
    public ApiResponseDto<SiteUserInfoDto> getUserInfo(){
        log.info("userinfo call!!");
        String username = GatewayRequestHeaderUtils.getUsernameOrThrowException();
        SiteUserInfoDto siteUserInfoDto = siteUserService.userInfo(username);
        return ApiResponseDto.readOk(siteUserInfoDto);
    }
    @PostMapping(value = "/info")
    public ApiResponseDto<SiteUserInfoDto> registerInfo(@RequestBody SiteUserInfoRegisterDto siteUserInfoRegisterDto){
        Long userId = GatewayRequestHeaderUtils.getUserIdOrThrowException();
        SiteUserInfoDto siteUserInfoDto = siteUserService.registerUserInfo(userId,siteUserInfoRegisterDto);
        return ApiResponseDto.createOk(siteUserInfoDto);
    }
    @PostMapping(value = "/profile/upload")
    public ApiResponseDto<String> uploadProfile(@RequestParam("file") MultipartFile file) {
        String profileImageUrl = siteUserService.uploadProfile(file);
        return ApiResponseDto.createOk(profileImageUrl);
    }
}
