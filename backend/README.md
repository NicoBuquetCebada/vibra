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
			"coverImg": "ruta/imagen"
		}
		]

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

	request: POST /api/posts/song
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