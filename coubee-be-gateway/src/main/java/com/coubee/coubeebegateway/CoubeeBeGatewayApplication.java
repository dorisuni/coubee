package com.coubee.coubeebegateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class CoubeeBeGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(CoubeeBeGatewayApplication.class, args);
    }
}
