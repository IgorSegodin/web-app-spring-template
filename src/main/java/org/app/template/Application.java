package org.app.template;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.PropertySource;

@PropertySource(value = {
		"${user.home}/Settings/ApplicationTemplate/application-template.properties",
		"${catalina.home}/conf/application-template.properties"
}, ignoreResourceNotFound = true)
@SpringBootApplication
public class Application {

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
