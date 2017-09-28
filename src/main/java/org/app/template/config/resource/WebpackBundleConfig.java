package org.app.template.config.resource;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Holds map with names or resources, where key is name without hash.
 *
 * @author i.segodin
 */
@Component("webpackBundle")
public class WebpackBundleConfig {

    private String pathToManifest;

    public static final String NAME_GROUP = "name";
    public static final String NAME_GROUP_CAPTURE = "${" + NAME_GROUP + "}";

    public static final String HASH_GROUP = "hash";

    public static final String EXTENSION_GROUP = "extension";
    public static final String EXTENSION_GROUP_CAPTURE = "${" + EXTENSION_GROUP + "}";

    public static final Pattern HASH_PATTERN = Pattern.compile("^(?<" + NAME_GROUP + ">.+)(?:\\.(?<" + HASH_GROUP + ">\\w+))(?<" + EXTENSION_GROUP + ">\\.\\w+)$");

    public static final Pattern NO_HASH_PATTERN = Pattern.compile("^(?<" + NAME_GROUP + ">.+)(?<" + EXTENSION_GROUP + ">\\.\\w+)$");

    @Value("${server.contextPath}")
    private String contextPath;

    @Value("${spring.config.jsManifestTTL:-1}")
    private long jsManifestTTL;

    private long lastModified = 0;

    private String relativePath = "assets";

    @Autowired
    private ObjectMapper objectMapper;

    private Map<String, String> javascriptManifest;

    @PostConstruct
    private void init(){
        pathToManifest = "assets/javascript-manifest.json";
        readManifest();
    }

    private Map<String, String> readManifest(){
        try {
            File file = new File(this.getClass().getClassLoader().getResource(pathToManifest).toURI());
            if((file.lastModified() - lastModified) > jsManifestTTL) {
                Map<String, String> javascriptManifest = objectMapper.readValue(file, new TypeReference<Map<String, String>>() {
                });
                this.javascriptManifest = new ConcurrentHashMap<>(javascriptManifest);
                this.lastModified = file.lastModified();
            }
        } catch (IOException | URISyntaxException ignore) {
        }
        return this.javascriptManifest;
    }

    /**
     * @param chunkName resource name without hash
     * @return real path name with hash
     * */
    public String getPath(String chunkName) {
        if (getJavascriptManifest().containsKey(chunkName)) {
            chunkName = getJavascriptManifest().get(chunkName);
        }

        return Paths.get(contextPath, relativePath, chunkName).toString().replace("\\", "/");
    }

    /**
     * @return {@link Matcher} for path with or without hash.
     * */
    protected Matcher getPathMatcher(String path) {
        Matcher matcher = HASH_PATTERN.matcher(path);
        if (!matcher.matches()) {
            matcher = NO_HASH_PATTERN.matcher(path);
        }
        if (matcher.matches()) {
            return matcher;
        } else {
            return null;
        }
    }

    /**
     * @param matcher path matcher
     * @param group name of a group
     * @return value of named group or null if matcher has no group or doesn't match
     * */
    protected String getGroupSafe(Matcher matcher, String group) {
        try {
            if (matcher.matches()) {
                return matcher.group(group);
            } else {
                return null;
            }
        } catch (IllegalArgumentException | IllegalStateException e) {
            return null;
        }
    }

    public Map<String, String> getJavascriptManifest() {
        return jsManifestTTL > -1 ? readManifest() : javascriptManifest;
    }

    public String getRelativePath() {
        return relativePath;
    }

    public String getContextPath() {
        return contextPath;
    }
}
