package org.app.template.acl;

import org.springframework.stereotype.Component;

/**
 * @author isegodin
 */
@Component
public class UserAcl {

    public boolean isCanViewUserList() {
        return true;
    }
}
