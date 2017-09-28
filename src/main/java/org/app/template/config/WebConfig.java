package org.app.template.config;

import javax.servlet.Filter;

import org.app.template.config.resource.WebpackBundleEtagHeaderFilter;
import org.app.template.config.resource.WebpackBundleResourceResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@Configuration
public class WebConfig extends WebMvcConfigurerAdapter {

	@Autowired
	private WebpackBundleResourceResolver webpackBundleResourceResolver;

	@Bean
	public FilterRegistrationBean registerWebpackBundleEtagHeaderFilter() {
		return getFilterRegistrationBean(new WebpackBundleEtagHeaderFilter(), "/assets/*", "WebpackBundleEtagHeaderFilter");
	}

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/assets/**")
				.addResourceLocations("classpath:assets/")
				.setCacheControl(CacheControl.empty().mustRevalidate())
				.resourceChain(false)
				.addResolver(webpackBundleResourceResolver);
	}

	private FilterRegistrationBean getFilterRegistrationBean(Filter filter, String urlPattern, String name) {
		FilterRegistrationBean registration = new FilterRegistrationBean();
		registration.setFilter(filter);
		registration.addUrlPatterns(urlPattern);
		registration.setName(name);
		registration.setOrder(1);
		return registration;
	}

}
