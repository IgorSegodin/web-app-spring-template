package org.app.template.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author isegodin
 */
@Controller
public class IndexController {

    @RequestMapping("/")
    public String getRoot() {
        return "redirect:index";
    }

    @RequestMapping("/index")
    public String getIndex() {
        return "pages/index";
    }

    @RequestMapping(value = "/403")
    public String error403() {
        return "pages/403";
    }

    @RequestMapping(value = "/login")
    public String getLogin() {
        return "pages/login";
    }
}
