package exception;

import java.util.List;

public class ErrorResponse {
	
	private String message;
	private Integer code;
	private List<String> details;

	public ErrorResponse(String message, Integer code) {
		this.message = message;
		this.code = code;
		this.details = null;
	}

	public ErrorResponse(String message, Integer code, List<String> details) {
		this.message = message;
		this.code = code;
		this.details = details;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public Integer getCode() {
		return code;
	}

	public void setCode(Integer code) {
		this.code = code;
	}

	public List<String> getDetails() {
		return details;
	}

	public void setDetails(List<String> details) {
		this.details = details;
	}

}
