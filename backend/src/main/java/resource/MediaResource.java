package resource;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import model.dto.FileUploadFormDTO;
import model.dto.MultiFileUploadFormDTO;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.jboss.resteasy.reactive.multipart.FileUpload;

@jakarta.ws.rs.Path("/media")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.MULTIPART_FORM_DATA)
public class MediaResource {

	private static final String UPLOAD_DIR = "media";
	private static final String URL = "http://localhost:8080/api/media/";

	@POST
	@jakarta.ws.rs.Path("/upload")
	public Response uploadFile(@BeanParam FileUploadFormDTO form) {
		try {
			String fileName = Paths.get(form.file.fileName()).getFileName().toString();
			Path uploadedPath = form.file.uploadedFile();
			Path targetPath = Path.of(UPLOAD_DIR, fileName);

			Files.createDirectories(targetPath.getParent());
			Files.move(uploadedPath, targetPath, StandardCopyOption.REPLACE_EXISTING);

			return Response.ok(Map.of("url", URL + fileName)).build();
		} catch (Exception e) {
			return Response
				.status(Response.Status.INTERNAL_SERVER_ERROR)
				.entity(Map.of("error", e.getMessage()))
				.build();
		}
	}

	@POST
	@jakarta.ws.rs.Path("/upload/multi")
	public Response uploadFiles(@BeanParam MultiFileUploadFormDTO form) {
		try {
			List<String> uploadedUrls = new ArrayList<>();

			for (FileUpload file : form.files) {
				String fileName = Paths.get(file.fileName()).getFileName().toString();
				Path uploadedPath = file.uploadedFile();
				Path targetPath = Path.of(UPLOAD_DIR, fileName);

				Files.createDirectories(targetPath.getParent());
				Files.move(uploadedPath, targetPath, StandardCopyOption.REPLACE_EXISTING);

				uploadedUrls.add(URL + fileName);
			}

			return Response.ok(Map.of("urls", uploadedUrls)).build();
		} catch (Exception e) {
			return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
				.entity(Map.of("error", e.getMessage()))
				.build();
		}
	}


    @GET
    @jakarta.ws.rs.Path("/{fileName}")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response getMedia(@PathParam("fileName") String fileName) throws IOException {
		File file = Path.of("media", fileName).toFile();

		if (!file.exists()) {
			return Response.status(Response.Status.NOT_FOUND).build();
		}

		String mimeType = Files.probeContentType(file.toPath());
		return Response.ok(file)
			.type(mimeType)
			.build();
	}

}
