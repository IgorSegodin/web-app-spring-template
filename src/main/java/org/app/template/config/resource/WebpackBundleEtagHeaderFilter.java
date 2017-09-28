package org.app.template.config.resource;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.regex.Matcher;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpMethod;
import org.springframework.util.Assert;
import org.springframework.util.ClassUtils;
import org.springframework.web.context.support.WebApplicationContextUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;
import org.springframework.web.util.WebUtils;

/**
 * ETag filter for Webpack resources. Adds ETag header and skips resource loading when resource is up to date.
 *
 * @author i.segodin
 */
public class WebpackBundleEtagHeaderFilter extends OncePerRequestFilter {

    static final String ETAG_REQUEST_ATTRIBUTE = WebpackBundleEtagHeaderFilter.class.getSimpleName() + ":ETag";

    private static final String HEADER_ETAG = "ETag";

    private static final String HEADER_IF_NONE_MATCH = "If-None-Match";

    private static final String HEADER_CACHE_CONTROL = "Cache-Control";

    private static final String DIRECTIVE_NO_STORE = "no-store";

    /** Checking for Servlet 3.0+ HttpServletResponse.getHeader(String) */
    private static final boolean servlet3Present = ClassUtils.hasMethod(HttpServletResponse.class, "getHeader", String.class);

    private WebpackBundleConfig bundleConfig;

    @Override
    protected void initFilterBean() throws ServletException {
        if(bundleConfig == null){
            bundleConfig = WebApplicationContextUtils.getRequiredWebApplicationContext(getServletContext()).getBean(WebpackBundleConfig.class);
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        HttpServletResponse responseToUse = response;
        if (!isAsyncDispatch(request) && !(response instanceof ContentCachingResponseWrapper)) {
            responseToUse = new HttpStreamingAwareContentCachingResponseWrapper(response, request);
        }

        ContentCachingResponseWrapper responseWrapper = WebUtils.getNativeResponse(responseToUse, ContentCachingResponseWrapper.class);
        Assert.notNull(responseWrapper, "ContentCachingResponseWrapper not found");
        HttpServletResponse rawResponse = (HttpServletResponse) responseWrapper.getResponse();

        String requestETag = request.getHeader(HEADER_IF_NONE_MATCH);
        /**
         * Check ETag from browser
         * */
        if (requestETag != null) {
            String relativePath = bundleConfig.getRelativePath() + "/";
            int startIdx = request.getServletPath().indexOf(relativePath);

            String relativeRequestPath = request.getServletPath().substring(startIdx + relativePath.length());

            String resourcePath = bundleConfig.getJavascriptManifest().get(relativeRequestPath);
            if (resourcePath == null) {
                resourcePath = relativeRequestPath;
            }

            Matcher matcher = bundleConfig.getPathMatcher(resourcePath);
            String hash = bundleConfig.getGroupSafe(matcher, bundleConfig.HASH_GROUP);

            if (hash != null && hash.equals(requestETag)) {
                /**
                 * Browser resource is up to date (304)
                 * */
                rawResponse.setHeader(HEADER_ETAG, hash);
                rawResponse.setStatus(HttpServletResponse.SC_NOT_MODIFIED);
                responseWrapper.copyBodyToResponse();
                return;
            }
        }

        /**
         * Need to invoke resource resolvers etc.
         * */
        filterChain.doFilter(request, responseToUse);

        if (!isAsyncStarted(request)) {
            if (rawResponse.isCommitted()) {
                responseWrapper.copyBodyToResponse();
            } else if (isEligibleForETag(request, responseWrapper, responseWrapper.getStatusCode())) {
                String responseETag = (String) request.getAttribute(ETAG_REQUEST_ATTRIBUTE);
                rawResponse.setHeader(HEADER_ETAG, responseETag);
                responseWrapper.copyBodyToResponse();
            } else {
                responseWrapper.copyBodyToResponse();
            }
        }

    }

    /**
     * Indicates whether the given request and response are eligible for ETag generation.
     * <p>The default implementation returns {@code true} if all conditions match:
     * <ul>
     * <li>response status codes in the {@code 2xx} series</li>
     * <li>request method is a GET</li>
     * <li>response Cache-Control header is not set or does not contain a "no-store" directive</li>
     * </ul>
     * @param request the HTTP request
     * @param response the HTTP response
     * @param responseStatusCode the HTTP response status code
     * @return {@code true} if eligible for ETag generation; {@code false} otherwise
     */
    protected boolean isEligibleForETag(HttpServletRequest request, HttpServletResponse response, int responseStatusCode) {

        if (responseStatusCode >= 200 && responseStatusCode < 300 && HttpMethod.GET.matches(request.getMethod())) {
            String cacheControl = null;
            if (servlet3Present) {
                cacheControl = response.getHeader(HEADER_CACHE_CONTROL);
            }
            if (cacheControl == null || !cacheControl.contains(DIRECTIVE_NO_STORE)) {
                return request.getAttribute(ETAG_REQUEST_ATTRIBUTE) != null;
            }
        }
        return false;
    }

    private static class HttpStreamingAwareContentCachingResponseWrapper extends ContentCachingResponseWrapper {

        private final HttpServletRequest request;

        public HttpStreamingAwareContentCachingResponseWrapper(HttpServletResponse response, HttpServletRequest request) {
            super(response);
            this.request = request;
        }

        @Override
        public ServletOutputStream getOutputStream() throws IOException {
            return (useRawResponse() ? getResponse().getOutputStream() : super.getOutputStream());
        }

        @Override
        public PrintWriter getWriter() throws IOException {
            return (useRawResponse() ? getResponse().getWriter() : super.getWriter());
        }

        private boolean useRawResponse() {
            return false;
        }
    }
}
