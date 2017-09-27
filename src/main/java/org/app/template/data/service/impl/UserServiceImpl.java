package org.app.template.data.service.impl;

import javax.servlet.http.HttpServletRequest;

import org.app.template.data.domain.QUser;
import org.app.template.data.domain.User;
import org.app.template.data.repository.UserRepository;
import org.app.template.data.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;

	@Autowired
	public UserServiceImpl(UserRepository userRepository) {
		this.userRepository = userRepository;
	}


	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		User user = userRepository.findOne(QUser.user.email.eq(email));
		if (user == null) {
			throw new UsernameNotFoundException("Can't find user with email: " + email);
		}
		return user;
	}

	@Override
	public User getCurrentUser() throws AuthenticationCredentialsNotFoundException {
		if (SecurityContextHolder.getContext() != null && SecurityContextHolder.getContext().getAuthentication() != null) {
			return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
		} else {
			throw new AuthenticationCredentialsNotFoundException("Not authenticated.");
		}
	}

	protected String getCurrentIp() {
		HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
				.getRequest();
		return request.getRemoteAddr();
	}
}
