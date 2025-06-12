# Backend — Vibra

Backend de la aplicación Vibra, desarrollado en Quarkus con programación reactiva, persistencia sobre PostgreSQL y autenticación JWT. Este servicio expone la API REST principal de la plataforma y gestiona la lógica de negocio, persistencia y seguridad.

---

### ⚙️ Tecnologías utilizadas

- Java 17
- Quarkus
- Hibernate Reactive
- Reactive Panache
- PostgreSQL
- SmallRye-JWT
- Apache Tika (validación de archivos multimedia)
- Maven

---

### 🔧 Requisitos previos

- Java (JDK)
- Maven
- Acceso a la base de datos PostgreSQL
- Claves públicas y privadas para firma JWT
- Variables de entorno configuradas correctamente

---

### 📄 Variables de entorno y configuración

La configuración se gestiona principalmente desde el archivo [application.properties](src/main/resources/application.properties) de Quarkus.

Parámetros clave a configurar:

```properties
# Conexión base de datos
quarkus.datasource.db-kind=postgresql
quarkus.datasource.reactive.url=postgresql://<host>:<port>/<database>
quarkus.datasource.username=<username>
quarkus.datasource.password=<password>

# Claves JWT
mp.jwt.verify.publickey.location=public-key.pem # Por defecto toma la carpeta /src/main/resources
smallrye.jwt.sign.key.location=private-key.pem

# Límite de tamaño para subida de archivos
quarkus.http.limits.max-body-size=50M

# CORS (si es necesario en desarrollo local)
quarkus.http.cors=true
quarkus.http.cors.origins=http://localhost:3000

# Ruta donde se almacenará el contenido multimedia
media.path=http://<host>:<port>/media

# Ejecución de un script en la base de datos
quarkus.hibernate-orm.sql-load-script=import.sql # Por defecto toma la carpeta /src/main/resources
quarkus.hibernate-orm.database.generation=drop-and-create # Método de generación de la base de datos
