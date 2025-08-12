package com.coubee.coubeebeuser.api.open;

import com.coubee.coubeebeuser.common.dto.ApiResponseDto;
import com.coubee.coubeebeuser.service.SiteUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/api/user/admin", produces = MediaType.APPLICATION_JSON_VALUE)
public class UserAdminController {

    private final SiteUserService siteUserService;

    @GetMapping("/notification/token")
    public ApiResponseDto<List<String>> getMyNotificationTokens(@RequestParam Long userId){
        List<String> tokenList = siteUserService.getNotificationTokenListByUserId(userId);
        return ApiResponseDto.readOk(tokenList);
    }
}
