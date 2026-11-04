package msg.onlineshopapi.exception;

public class OrderNotProcessableException extends RuntimeException {

    public OrderNotProcessableException(String message) {
        super(message);
    }
}
