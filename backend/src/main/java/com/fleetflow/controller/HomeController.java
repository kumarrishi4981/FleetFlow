package com.fleetflow.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping(value = {
        "/",
        "/map",
        "/vehicles",
        "/vehicles/**",
        "/orders",
        "/routes",
        "/dispatch"
    })
    public String index() {
        return "forward:/index.html";
    }
}
