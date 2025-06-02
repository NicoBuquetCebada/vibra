package resource;

import jakarta.ws.rs.BeanParam;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import model.dto.FileUploadFormDTO;
import model.dto.MultiFileUploadFormDTO;
import org.apache.tika.Tika;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@jakarta.ws.rs.Path("/media")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.MULTIPART_FORM_DATA)
public class MediaResource {

    private static final String UPLOAD_DIR = "media";
    private static final String URL = "http://localhost:8080/api/media/";
    private static final Tika tika = new Tika();

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "audio/mpeg", "audio/wav"
    );

    @POST
    @jakarta.ws.rs.Path("/upload")
    public Response uploadFile(@BeanParam FileUploadFormDTO form) {
        try {
            Path uploadedPath = form.file.uploadedFile();
            String mimeType = tika.detect(uploadedPath);

            if (!ALLOWED_TYPES.contains(mimeType)) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Tipo de archivo no permitido: " + mimeType))
                        .build();
            }

            String extension = getExtension(form.file.fileName());
            String uuid = UUID.randomUUID().toString();
            String safeFileName = uuid + extension;
            Path targetPath = Path.of(UPLOAD_DIR, safeFileName);

            Files.createDirectories(targetPath.getParent());
            Files.move(uploadedPath, targetPath, StandardCopyOption.REPLACE_EXISTING);

            return Response.ok(Map.of("url", URL + safeFileName)).build();

        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
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
                Path uploadedPath = file.uploadedFile();
                String mimeType = tika.detect(uploadedPath);

                if (!ALLOWED_TYPES.contains(mimeType)) {
                    return Response.status(Response.Status.BAD_REQUEST)
                            .entity(Map.of("error", "Tipo de archivo no permitido: " + file.fileName()))
                            .build();
                }

                String extension = getExtension(file.fileName());
                String uuid = UUID.randomUUID().toString();
                String safeFileName = uuid + extension;
                Path targetPath = Path.of(UPLOAD_DIR, safeFileName);

                Files.createDirectories(targetPath.getParent());
                Files.move(uploadedPath, targetPath, StandardCopyOption.REPLACE_EXISTING);

                uploadedUrls.add(URL + safeFileName);
            }

            if (uploadedUrls.isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "No se subió ningún archivo válido"))
                        .build();
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
        File file = Path.of(UPLOAD_DIR, fileName).toFile();

        if (!file.exists()) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(file)
                .type(MediaType.APPLICATION_OCTET_STREAM)
                .header("Content-Disposition", "attachment; filename=\"" + fileName + "\"")
                .header("Cache-Control", "public, max-age=31536000, immutable")
                .build();
    }

    private String getExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        return (dotIndex != -1) ? fileName.substring(dotIndex).toLowerCase() : "";
    }
}
