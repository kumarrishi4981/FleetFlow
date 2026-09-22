package com.fleetflow.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpServletResponse;

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
    public String index(HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
        return "forward:/index.html";
    }
}
