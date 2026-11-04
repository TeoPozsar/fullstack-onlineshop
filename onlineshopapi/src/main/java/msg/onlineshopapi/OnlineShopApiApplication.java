package msg.onlineshopapi;

import msg.onlineshopapi.security.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class OnlineShopApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(OnlineShopApiApplication.class, args);
	}

}
