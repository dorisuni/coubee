package com.coubee.coubeebeuser.remote.alim;

import com.coubee.coubeebeuser.remote.alim.dto.SendSmsDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "backend-alim", path = "/backend/alim/v1")
public interface RemoteAlimService {
    @GetMapping(value = "/hello")
    String hello();

    @PostMapping(value = "/sms")
    SendSmsDto.Response sendSms(SendSmsDto.Request request);
}
