package resource;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import model.dto.FileUploadFormDTO;

import java.nio.file.*;
import java.nio.file.Path;
import java.util.Map;

@jakarta.ws.rs.Path("/media")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.MULTIPART_FORM_DATA)
public class MediaResource {

	private static final String UPLOAD_DIR = "media";

	@POST
	@jakarta.ws.rs.Path("/upload")
	public Response uploadFile(@BeanParam FileUploadFormDTO form) {
		try {
			String fileName = Paths.get(form.file.fileName()).getFileName().toString();
			Path uploadedPath = form.file.uploadedFile();
			Path targetPath = Path.of(UPLOAD_DIR, fileName);

			Files.createDirectories(targetPath.getParent());
			Files.move(uploadedPath, targetPath, StandardCopyOption.REPLACE_EXISTING);

			return Response.ok(Map.of("url", "/media/" + fileName)).build();
		} catch (Exception e) {
			return Response
				.status(Response.Status.INTERNAL_SERVER_ERROR)
				.entity(Map.of("error", e.getMessage()))
				.build();
		}
	}

}
