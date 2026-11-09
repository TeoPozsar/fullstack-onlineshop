package msg.onlineshopapi.security;

import org.junit.jupiter.api.Test;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtStompChannelInterceptorTest {

    private final JwtService jwtService = mock(JwtService.class);
    private final UserDetailsService userDetailsService = mock(UserDetailsService.class);
    private final JwtStompChannelInterceptor interceptor =
            new JwtStompChannelInterceptor(jwtService, userDetailsService);

    @Test
    void rejectsConnectWithoutBearerToken() {
        Message<?> message = stompMessage(StompCommand.CONNECT, null);

        assertThrows(IllegalStateException.class, () -> interceptor.preSend(message, messageChannel()));
    }

    @Test
    void authenticatesConnectWithValidBearerToken() {
        var user = User.withUsername("customer@example.com")
                .password("ignored")
                .roles("CUSTOMER")
                .build();
        when(jwtService.extractUsername("token")).thenReturn(user.getUsername());
        when(userDetailsService.loadUserByUsername(user.getUsername())).thenReturn(user);
        when(jwtService.isTokenValid("token", user)).thenReturn(true);

        Message<?> result = interceptor.preSend(
                stompMessage(StompCommand.CONNECT, "Bearer token"),
                messageChannel()
        );

        assertEquals(user.getUsername(), StompHeaderAccessor.wrap(result).getUser().getName());
    }

    @Test
    void rejectsSubscriptionWithoutAuthenticatedConnect() {
        Message<?> message = stompMessage(StompCommand.SUBSCRIBE, null);

        assertThrows(IllegalStateException.class, () -> interceptor.preSend(message, messageChannel()));
    }

    private Message<?> stompMessage(StompCommand command, String authorization) {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(command);
        if (authorization != null) {
            accessor.addNativeHeader("Authorization", authorization);
        }
        accessor.setLeaveMutable(true);
        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }

    private org.springframework.messaging.MessageChannel messageChannel() {
        return mock(org.springframework.messaging.MessageChannel.class);
    }
}
