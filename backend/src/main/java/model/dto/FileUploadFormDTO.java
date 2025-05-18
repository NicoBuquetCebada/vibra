package model.dto;

import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

public class FileUploadFormDTO {

	@RestForm
	public FileUpload file;
}
