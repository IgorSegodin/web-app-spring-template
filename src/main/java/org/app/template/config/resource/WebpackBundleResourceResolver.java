package org.app.template.config.resource;

import java.io.IOException;
import java.util.List;
import java.util.regex.Matcher;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.resource.PathResourceResolver;
import org.springframework.web.servlet.resource.ResourceResolverChain;

/**
 * Resource resolver, which searches for webpack resources.
 *
 * @author i.segodin
 */
@Component
public class WebpackBundleResourceResolver extends PathResourceResolver {

    @Autowired
    private WebpackBundleConfig bundleConfig;

    private PathMatchingResourcePatternResolver resourcePatternResolver = new PathMatchingResourcePatternResolver();

    @Override
    protected Resource resolveResourceInternal(HttpServletRequest request, String requestPath, List<? extends Resource> locations, ResourceResolverChain chain) {

        Matcher requestMatcher = bundleConfig.getPathMatcher(requestPath);

        // original request resource hash
        String requestHash = bundleConfig.getGroupSafe(requestMatcher, WebpackBundleConfig.HASH_GROUP);

        String pathFromManifest = bundleConfig.getJavascriptManifest().get(requestPath);

        // when known resource then no need to search with pattern
        boolean knownResource = requestHash != null || pathFromManifest != null;

        if (knownResource) {
            String knownPath = pathFromManifest != null ? pathFromManifest : requestPath;
            for (Resource location : locations) {
                try {
                    Resource resource = getResource(knownPath, location);
                    if (resource != null) {
                        String hash = bundleConfig.getGroupSafe(WebpackBundleConfig.HASH_PATTERN.matcher(knownPath), WebpackBundleConfig.HASH_GROUP);
                        if (hash != null) {
                            request.setAttribute(WebpackBundleEtagHeaderFilter.ETAG_REQUEST_ATTRIBUTE, hash);
                        }
                        return resource;
                    }
                } catch (IOException e) {
                    logger.trace("Failure checking for relative resource - trying next location", e);
                }
            }
        } else {
            String relativeFolderPath = bundleConfig.getRelativePath() + "/";

            try {
                /**
                 * Searching for resource
                 * */
                Resource resource = null;

                /**
                 * First search resource with hash
                 * */
                String hashPattern = ResourcePatternResolver.CLASSPATH_ALL_URL_PREFIX + relativeFolderPath + requestMatcher.replaceFirst(WebpackBundleConfig.NAME_GROUP_CAPTURE + ".*" + WebpackBundleConfig.EXTENSION_GROUP_CAPTURE);

                Resource[] hashResources = resourcePatternResolver.getResources(hashPattern);
                if (hashResources != null && hashResources.length > 0) {
                    resource = hashResources[0];

                } else {
                    /**
                     * Try to search without hash
                     * */
                    String noHashPattern = ResourcePatternResolver.CLASSPATH_ALL_URL_PREFIX + relativeFolderPath + requestMatcher.replaceFirst(WebpackBundleConfig.NAME_GROUP_CAPTURE + WebpackBundleConfig.EXTENSION_GROUP_CAPTURE);
                    Resource[] noHashResources = resourcePatternResolver.getResources(noHashPattern);
                    if (noHashResources != null && noHashResources.length > 0) {
                        resource = noHashResources[0];
                    }
                }

                if (resource != null) {
                    /**
                     * Need to save resource to manifest map (not to search again) and set ETag to request attribute for filter
                     * */
                    String absolutePath = resource.getURL().getPath();
                    int startRelativeIdx = absolutePath.indexOf(relativeFolderPath + requestMatcher.replaceFirst(WebpackBundleConfig.NAME_GROUP_CAPTURE));
                    String relativeResourcePath = absolutePath.substring(startRelativeIdx + relativeFolderPath.length());

                    Matcher matcher = bundleConfig.getPathMatcher(relativeResourcePath);
                    String hash = bundleConfig.getGroupSafe(matcher, WebpackBundleConfig.HASH_GROUP);

                    String manifestKey = relativeResourcePath;
                    if (hash != null) {
                        manifestKey = matcher.replaceFirst(WebpackBundleConfig.NAME_GROUP_CAPTURE + WebpackBundleConfig.EXTENSION_GROUP_CAPTURE);

                        request.setAttribute(WebpackBundleEtagHeaderFilter.ETAG_REQUEST_ATTRIBUTE, hash);
                    }
                    bundleConfig.getJavascriptManifest().putIfAbsent(manifestKey, relativeResourcePath);

                    return resource;
                }

            } catch (IOException e) {
                logger.trace("Failure searching resources", e);
            }
        }
        return null;
    }

    @Override
    protected String resolveUrlPathInternal(String resourceUrlPath, List<? extends Resource> locations, ResourceResolverChain chain) {
        return null;
    }

}
