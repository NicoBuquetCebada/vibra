# Mapa de endpoints de la API

ROOT PATH: http://localhost:8080

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

search, buscador de usuarios, albumes y canciones. Se introduce el texto a buscar y devuelve nombre, id del post (en caso de user es null) y tipo (user, song, album)

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
				"mail": "correo electronico",
				"firstName": "nombre",
				"surname": "apellido",
				"pass": "contraseña"
			}
	
	response: code 201

 - Get user page, obtiene los datos del usuario autenticado a traves del JWT
	
	request: GET /api/users/page

	response:
		{
			"name": "string",
			"profile_img": "ruta/imagen",
			"posts": 100,
			"followed": 100,
			"followers": 100
		}

 - Get other user page, obtiene los datos de cualquier usuario a traves de su user name
	
	request: GET /api/users/page/{user_name}

	response:
		{
			"name": "string",
			"profile_img": "ruta/imagen",
			"posts": 100,
			"followed": 100,
			"followers": 100
		}

 - Get user posts, obtiene las publicaciones del usuario autenticado a través de JWT
	
	request: GET /api/users/posts

	reponse:
		{
			"id": 1,
			"userName": "string",
			"createdAt": "2022-03-10T12:15:50",
			"type": "song o album",
			"contentId": 1,
			"name": "songName o albumName",
			"coverImg": "ruta/cover"
		}

 - Get other user posts, obtiene las publicaciones de cualquier usuario a traves del user name
	
	request: GET /api/users/posts/{user_name}

	reponse:
		{
			"id": 1,
			"userName": "string",
			"createdAt": "2022-03-10T12:15:50",
			"type": "song o album",
			"contentId": 1,
			"name": "songName o albumName",
			"coverImg": "ruta/cover"
		}

 - Get user rates, obtiene las publicaciones puntuadas del usuario autenticado a través de JWT
	
	request: GET /api/users/rates

	reponse:
		{
			"id": 1,
			"userName": "string",
			"createdAt": "2022-03-10T12:15:50",
			"type": "song o album",
			"contentId": 1,
			"name": "songName o albumName",
			"coverImg": "ruta/cover"
		}

 - Get user saves, obtiene las publicaciones guardadas del usuario autenticado a través de JWT
	
	request: GET /api/users/saves

	reponse:
		{
			"id": 1,
			"userName": "string",
			"createdAt": "2022-03-10T12:15:50",
			"type": "song o album",
			"contentId": 1,
			"name": "songName o albumName",
			"coverImg": "ruta/cover"
		}

 - Get user reposts, obtiene las publicaciones reposteadas por el usuario autenticado a través de JWT
	
	request: GET /api/users/reposts

	reponse:
		{
			"id": 1,
			"userName": "string",
			"createdAt": "2022-03-10T12:15:50",
			"type": "song o album",
			"contentId": 1,
			"name": "songName o albumName",
			"coverImg": "ruta/cover"
		}

 - Get other user reposts, obtiene las publicaciones reposteadas por otro usuario a traves del user name
	
	request: GET /api/users/reposts/{user_name}

	reponse:
		{
			"id": 1,
			"userName": "string",
			"createdAt": "2022-03-10T12:15:50",
			"type": "song o album",
			"contentId": 1,
			"name": "songName o albumName",
			"coverImg": "ruta/cover"
		}

	IMPORTANTE: En los endpoint de users/posts, users/saves, users/rates y users/saves no está la información del audio de la canción (canciones en caso de album) Cuando se traigan esta información se podrán listar los posts pero hará falta por cada uno de los posts hacer una petición a los endpoint de song (información detallada en el apartado songs), en caso de:

		"type": "song" -> GET /api/songs/{id} del que se utilizara solo la propiedad audio

		"type": "album" -> GET /api/songs/albums/{album_id} del que se utilizarán name y audio de cada canción del array obtenido

	FIN DEL AVISO

 - Update user field, actualiza un campo del usuario a traves de la url. el campo field de la url solo puede ser "mail" o "profileimg"
	
	request: PATCH /api/users/update/{field}/{value}

	response: code 200

- Update user password, actualiza la contraseña del usuario a traves del body. Se deberá especificar la contraseña actual para cambiarla.

	request: PATCH /api/users/update/password
		body:
			{
				"oldPass": "contraseña anterior",
				"newPass": "nueva contraseña"
			}

	response: code 200

 - Delete user, borra la cuenta de usuario permanentemente.

	request: DELETE /api/users/{user_name}

	response: code 204

# FOLLOWS

 - Get followed, obtiene una lista con los usuarios a los que sigue el usuario autenticado a traves del JWT

	request: GET /api/follows/followed

	response:
		[
		{
			"name": "string",
			"profileImg": "string"
		},
		{
			"name": "string",
			"profileImg": "string"
		}
		]
 
 - Get other user followed, obtiene una lista con los usuarios a los que sigue otro usuario a través del user name

	request: GET /api/follows/followed/{user_name}

	response:
		[
		{
			"name": "string",
			"profileImg": "string"
		},
		{
			"name": "string",
			"profileImg": "string"
		}
		]

 - Get followers, obtiene una lista con los usuarios que siguen a al usuario autenticado a través del JWT

	request: GET /api/follows/followers

	response:
		[
		{
			"name": "string",
			"profileImg": "string"
		},
		{
			"name": "string",
			"profileImg": "string"
		}
		]

 - Get other user followers, obtiene una lista con los usuarios que siguen a otro usuario a traves del user name

	request: GET /api/follows/followers/{user_name}

	response:
		[
		{
			"name": "string",
			"profileImg": "string"
		},
		{
			"name": "string",
			"profileImg": "string"
		}
		]

 - Get follow, obtiene si el usuario autenticado sigue a un usuario

	request: GET /api/follows/follow/{user_name}

	response: 
		si lo sigue: code 200
		si no lo sigue: code 404
	
 - Follow, el usario autenticado sigue a un usuario

	request: POST /api/follows/follow/{user_name}

	response: code 201

 - Unfollow, el usario autenticado deja de seguir a un usuario

	request: DELETE /api/follows/follow/{user_name}

	response: code code 204


# SONGS

 - Get song, obtiene una canción por id

	request: GET /api/songs/{id}

	response:
		{
			"id": 9007199254740991,
			"name": "string",
			"coverImg": "string",
			"date": "2022-03-10T12:15:50",
			"audio": "string"
		}

 - Get songs by album, obtiene una canción por el id del album

	request: GET /api/songs/albums/{album_id}

	response:
		[
		{
			"id": 9007199254740991,
			"name": "string",
			"coverImg": "string",
			"date": "2022-03-10T12:15:50",
			"audio": "string"
		},
		{
			"id": 9007199254740991,
			"name": "string",
			"coverImg": "string",
			"date": "2022-03-10T12:15:50",
			"audio": "string"
		}
		]

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

 - Get post by id, obtener la información relevante de un post a traves de su id (en la barra de busqueda se da el id del post. Este se podrá buscar a través de este endpoint)

	request: GET /api/posts/{post_id}

	response: 
		{
			"id": 1,
			"userName": "nico",
			"createdAt": "2024-03-17T09:00:00",
			"type": "song",
			"contentId": 4,
			"name": "mastercaster",
			"coverImg": "http://localhost:8080/api/media/defaultc.png"
		}

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

# NOTIFICATIONS

- Get user notifications, obtener las notificaciones del usuario autenticado a traves del JWT. El contentId es el id del contenido notificado para redirigir a el mas adelante.

	request: GET /api/notifications

	response:
		[
		{
			"type": "repost, rate o follow",
			"createdAt": "2022-03-10T12:15:50",
			"actionUserName": "usuario que realiza la accion",
			"profileImg": "su imagen de perfil",
			"contentUserName": "usuario que recibe notificacion",
			"contentId": 1
		},
		{
			"type": "repost, rate o follow",
			"createdAt": "2022-03-10T12:15:50",
			"actionUserName": "usuario que realiza la accion",
			"profileImg": "su imagen de perfil",
			"contentUserName": "usuario que recibe notificacion",
			"contentId": 1
		}
		]