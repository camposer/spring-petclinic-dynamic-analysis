package org.springframework.samples.petclinic.logging;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties("logging")
public class LoggingConfig {
	private List<String> components;

	public List<String> getComponents() {
		return components;
	}

	public void setComponents(List<String> components) {
		this.components = components;
	}
}
