package org.app.template.controller;

import org.app.template.data.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import java.util.HashMap;
import java.util.Map;

/**
 * @author isegodin
 */
@Controller
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @RequestMapping("/list")
    @PreAuthorize("@userAcl.canViewUserList")
    public ModelAndView getUserList() {
        Map<String, Object> ctx = new HashMap<>();
        ctx.put("users", userRepository.findAll());

        return new ModelAndView("pages/user_list", ctx);
    }
}
