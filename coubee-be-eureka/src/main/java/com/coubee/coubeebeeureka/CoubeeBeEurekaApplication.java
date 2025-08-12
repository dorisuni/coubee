package com.coubee.coubeebeeureka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class CoubeeBeEurekaApplication {

    public static void main(String[] args) {
        SpringApplication.run(CoubeeBeEurekaApplication.class, args);
    }

}
