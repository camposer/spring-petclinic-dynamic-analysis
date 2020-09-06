package org.springframework.samples.petclinic.logging;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class LogExecutionTimeAspect {

	private final Logger logger = LoggerFactory.getLogger(LogExecutionTimeAspect.class);

	@Pointcut("@annotation(org.springframework.samples.petclinic.logging.LogExecutionTime)")
	public void annotatedMethod() {
	}

	@Pointcut("@within(org.springframework.samples.petclinic.logging.LogExecutionTime)")
	public void annotatedClass() {
	}

	@Around("execution(* *(..)) && (annotatedMethod() || annotatedClass())")
	public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
		long start = System.currentTimeMillis();

		Object proceed = joinPoint.proceed();

		long executionTime = System.currentTimeMillis() - start;

		logger.debug(joinPoint.getSignature() + " executed in " + executionTime + "ms");
		return proceed;
	}

}
