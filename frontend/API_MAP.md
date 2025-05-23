# Mapa de endpoints de la API

## HOME

- Obtener objetos del HOME (debe contener el JWT)
	
	request: GET /api/home

	response:
		[
		{
			"type": "post",
			"createdAt": "2022-03-10T12:15:50",
			"user": {
				"name": "string",
				"profileImg": "ruta/imagen"
			},
			"repostUser": {
				"name": "string",
				"profileImg": "ruta/imagen"
			},
			"content": "album",
			"song": {
				"name": "string",
				"audio": "ruta/audio"
			},
			"album": {
				"name": "string",
				"songs": [
					{
						"name": "string",
						"audio": "ruta/audio"
					},
					{
						"name": "string",
						"audio": "ruta/audio"
					}
				]
			},
			"coverImg": "ruta/imagen",
			"postId": 1,
		}
		]

- get metrics, Obtener las metricas de un post. Este endpoint sirve para obtener las metricas de las publicaciones del Home

	request: GET /api/home/{post_id}

	response:
		{
			"postId": 1,
			"rate": 4,
			"saved": true,
			"reposted": true
		}

search, buscador de usuarios, albumes y canciones. Se introduce el texto a buscar y devuelve nombre, id (en caso de user es null) y tipo (user, song, album)

	request: GET /api/home/search/{search}

	response:
		[
		{
			"name": "string",
			"id": 1,
			"type": "string"
		},
		{
			"name": "string",
			"id": 1,
			"type": "string"
		}
		]

# METRICS

- rate post, hacer rate a un post

	request: POST /api/metrics/rate
		body:
			{
				"rate": 4,
				"postId": 1
			}
	response: code 201

-  update rate, actualiza un rate

	request: PUT /api/metrics/rate
		body:
			{
				"rate": 4,
				"postId": 1
			}
	response: code 200

- save post, hacer save a un post. El valor del body es el id de post

	request: POST /api/metrics/save
		body: 1
	response: code 201

- delete save, eliminar un save. El valor del pathParam es el id de post

	request: DELETE /api/metrics/save/{post_id}
		body: 1
	response: code 204

- repost post, hacer repost a un post. El valor del body es el id de post

	request: POST /api/metrics/repost
		body: 1
	response: code 201

- delete repost, eliminar un repost. El valor del pathParam es el id de post

	request: DELETE /api/metrics/repost/{post_id}
		body: 1
	response: code 204
	
# USERS

- Login

	request: POST /api/users/login
		body:
			{
				"identifier": "userName or male",
				"pass": "contraseña
			}

	response:
		{
			"token": "JWT Token"
		}

- Register (el role siempre debe ser user, lo cambiaré para que sea automatico mas adelante)

	request: POST /api/users/register 
		body:
			{
				"name": "userName",
				"mail": "string",
				"firstName": "nombre de pila",
				"surname": "apellido",
				"pass": "contraseña",
				"profileImg": "ruta/imagen",
				"role": "user"
			}
	
	response: code 201

# POSTS

- Add song post, crear un post con una canción

	request: POST /api/posts/song
		body:
			{
				"songName": "string",
				"coverImg": "ruta/imagen",
				"audio": "ruta/audio"
			}

	response: code 201

- Add album post, crear un post con un album

	request: POST /api/posts/album
		body:
			{
				"albumName": "string",
				"coverImg": "ruta/imagen",
				"songs": [
					{
						"name": "string",
						"audio": "ruta/audio"
					},
					{
						"name": "string",
						"audio": "ruta/audio"
					}
				]
			}

	response: code 201

# MEDIA

 IMPORTANTE: Las rutas que te devuelve el servidor las puedes usar directamente en un url, las está sirviendo quarkus. Por ejemplo con <img src="ruta/que/devuelve/la/consulta"><img> o cualquier otro recurso del front

 - Upload 1 File, subir un solo archivo
	
	request: POST /api/media/upload  Tipo de dato del request: multipart/form-data
		body: file string($binary)
	
	response:
		{
			"url": "ruta"
		}
 - Upload multiple Files, subir varios archivos
	
	request: POST /api/media/upload/multi  Tipo de dato del request: multipart/form-data
		body: file array string($binary)
	
	response:
		{
			"urls": [
				"ruta",
				"ruta"
			]
		}