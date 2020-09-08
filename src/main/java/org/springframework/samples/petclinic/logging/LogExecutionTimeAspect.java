package org.springframework.samples.petclinic.logging;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Profile("dynamic-analysis")
public class LogExecutionTimeAspect {
	private final Logger logger = LoggerFactory.getLogger(LogExecutionTimeAspect.class);

	private final LoggingConfig loggingConfig;

	public LogExecutionTimeAspect(LoggingConfig loggingConfig) {
		this.loggingConfig = loggingConfig;
	}

	@Pointcut("@annotation(org.springframework.samples.petclinic.logging.LogExecutionTime)")
	public void annotatedMethod() {
	}

	@Pointcut("@within(org.springframework.samples.petclinic.logging.LogExecutionTime)")
	public void annotatedClass() {
	}

	@Pointcut("!execution(* org.springframework.samples.petclinic.logging..*(..))")
	public void ignoreLoggingClasses() {
	}

	@Around("execution(* *(..)) && (annotatedMethod() || annotatedClass())")
	public Object logExecutionTimeAround(ProceedingJoinPoint joinPoint) throws Throwable {
		return logExecutionTime(joinPoint);
	}

	@Around("execution(* org.springframework.samples.petclinic..*.*(..)) && ignoreLoggingClasses()")
	public Object logExecutionTimeMatches(ProceedingJoinPoint joinPoint) throws Throwable {
		String signature = joinPoint.getSignature().toString();
		boolean matches = loggingConfig.getComponents().stream().map(c -> signature.matches(c)).reduce(false, (a, b) -> a | b);
		if (matches) {
			return logExecutionTime(joinPoint);
		}
		return joinPoint.proceed();
	}

	private Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
		long start = System.currentTimeMillis();
		Object proceed = joinPoint.proceed();
		long executionTime = System.currentTimeMillis() - start;
		logger.info("{} executed in {}ms", joinPoint.getSignature() , executionTime);
		return proceed;
	}
}
