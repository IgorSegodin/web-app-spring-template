package org.app.template.data.service;

import org.app.template.data.domain.User;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.List;

public interface UserService extends UserDetailsService {

    User getCurrentUser() throws AuthenticationCredentialsNotFoundException;
}
