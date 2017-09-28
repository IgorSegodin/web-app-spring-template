package org.app.template.config;

import org.app.template.data.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private final UserService userService;

    @Autowired
    public SecurityConfig(UserService userService) {
        this.userService = userService;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userService);
        provider.setPasswordEncoder(new BCryptPasswordEncoder());
        http
                .authenticationProvider(provider)
                .authorizeRequests()
                    .antMatchers("/login").anonymous()
                    .antMatchers("/static/**").permitAll()
                    .antMatchers("/assets/**").permitAll()
                    .antMatchers("/**").authenticated()
                    .and()
                .formLogin()
                    .loginPage("/login")
                    .loginProcessingUrl("/process-login")
                    .failureUrl("/login?error")
                    .passwordParameter("password")
                    .usernameParameter("email")
                    .defaultSuccessUrl("/")
                    .and()
                .csrf()
                    .disable()
                    .httpBasic()
                    .and()
                .logout()
                    .logoutUrl("/logout")
                    .deleteCookies("JSESSIONID")
                    .invalidateHttpSession(true)
                    .and()
                .exceptionHandling()
                    .accessDeniedPage("/403");
    }

}
