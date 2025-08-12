package com.coubee.coubeebeuser.api.open;

import com.coubee.coubeebeuser.common.dto.ApiResponseDto;
import com.coubee.coubeebeuser.domain.dto.SiteUserLoginDto;
import com.coubee.coubeebeuser.domain.dto.SiteUserLoginResponseDto;
import com.coubee.coubeebeuser.domain.dto.SiteUserRefreshDto;
import com.coubee.coubeebeuser.domain.dto.SiteUserRegisterDto;
import com.coubee.coubeebeuser.secret.jwt.dto.TokenDto;
import com.coubee.coubeebeuser.service.SiteUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping(value = "/api/user/auth", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
public class UserAuthController {
    private final SiteUserService siteUserService;

    @PostMapping(value = "/signup")
    public ApiResponseDto<String> register(@RequestBody @Valid SiteUserRegisterDto registerDto) {
        siteUserService.registerUserAndNotify(registerDto);
        return ApiResponseDto.defaultOk();
    }

//    @PostMapping(value = "/login")
//    public ApiResponseDto<TokenDto.AccessRefreshToken> login(@RequestBody @Valid SiteUserLoginDto loginDto) {
//        TokenDto.AccessRefreshToken token = siteUserService.login(loginDto);
//        SiteUserLoginResponseDto responseDto = new SiteUserLoginResponseDto();
//        responseDto.setUserInfo();
//        responseDto.setAccessRefreshToken(token);
//        return ApiResponseDto.createOk(token);
//    }

    @PostMapping(value = "/login")
    public ApiResponseDto<SiteUserLoginResponseDto> login(@RequestBody @Valid SiteUserLoginDto loginDto) {
        SiteUserLoginResponseDto responseDto = siteUserService.login(loginDto);
        return ApiResponseDto.createOk(responseDto);
    }

    @PostMapping(value = "/refresh")
    public ApiResponseDto<TokenDto.AccessToken> refresh(@RequestBody @Valid SiteUserRefreshDto refreshDto) {
        var token = siteUserService.refresh(refreshDto);
        return ApiResponseDto.createOk(token);
    }
}

