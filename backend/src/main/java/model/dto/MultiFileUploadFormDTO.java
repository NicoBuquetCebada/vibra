package model.dto;

import java.util.List;

import org.jboss.resteasy.reactive.RestForm;
import org.jboss.resteasy.reactive.multipart.FileUpload;

public class MultiFileUploadFormDTO {

	@RestForm("file")
	public List<FileUpload> files;

}
