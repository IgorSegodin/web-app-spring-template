package org.app.template.data.repository;

import org.app.template.data.domain.User;
import org.springframework.data.querydsl.QueryDslPredicateExecutor;
import org.springframework.data.repository.CrudRepository;

public interface UserRepository extends CrudRepository<User, Long>, QueryDslPredicateExecutor<User> {

    User findByEmail(String email);
}
