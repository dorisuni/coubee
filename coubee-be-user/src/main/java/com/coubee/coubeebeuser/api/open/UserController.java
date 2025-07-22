package com.coubee.coubeebeuser.api.open;

import com.coubee.coubeebeuser.common.dto.ApiResponseDto;
import com.coubee.coubeebeuser.common.web.context.GatewayRequestHeaderUtils;
import com.coubee.coubeebeuser.remote.alim.RemoteAlimService;
import com.coubee.coubeebeuser.remote.alim.dto.SendSmsDto;
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
    private final FileUploader fileUploader;

    @GetMapping(value = "/test")
    public ApiResponseDto<String> test() {
        String userId = GatewayRequestHeaderUtils.getUserIdOrThrowException();
        log.error("userId = {}", userId);
        return ApiResponseDto.createOk(userId);
    }

    @PostMapping(value = "/sms")
    public ApiResponseDto<SendSmsDto.Response> sms(@RequestBody SendSmsDto.Request request) {
        var result = remoteAlimService.sendSms(request);
        return ApiResponseDto.createOk(result);
    }

    @PostMapping(value = "/profile/upload")
    public ApiResponseDto<String> uploadProfile(@RequestParam("profile_image") MultipartFile profileImage) {
        String profileImageUrl = fileUploader.upload(profileImage,"profile");
        return ApiResponseDto.createOk(profileImageUrl);
    }
}
