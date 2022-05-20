# Node.js real-time multi-player quiz

This is a demonstration Node.js real-time multi-player quiz. It launches:

* 2 replicated HTTP web servers (Node.js Express app)
* 3 replicated Web Socket servers (Node.js application)
* a [PostgreSQL](https://www.postgresql.org/) database server
* a [Traefic](https://traefik.io/traefik/) reverse proxy and load balancer to direct traffic to the HTTP or WS servers
* optionally, an [Adminer](https://www.adminer.org/) database client.


## Requirements

[Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) are required to run this demonstration.


## Configuration

Database and application settings can be edited in the `.env` file.


## Launch in development mode

Run the following command from the project root directory (`nodequiz`) to start all servers with live reloading when files are updated:

```sh
docker-compose up
```

Then open <http://quiz.localhost/> in your browser and start or join a quiz.

The Traefic load balancer dashboard is accessed at <http://localhost:8080/>

The [Adminer](https://www.adminer.org/) database client is accessed at <http://adminer.localhost/> with the following credentials:

* **System**: `PostgreSQL`
* **Server:** `dbserver` (or `host.docker.internal` or your PC's IP address)
* **Username:** `quizuser`
* **Password:** `quizpass`
* **Database:** `quiz`

You can also use [pgAdmin](./pgadmin.md) if you require a more sophisticated database client.

If using another database client application, use `localhost` as the server name.


### Use a Node.js debugging client

To debug, you must bypass the load balancer and attach to a single instance of the running application. View the running containers with:

```sh
docker container ls
```

Note the `PORTS` mappings and `NAMES`:

```txt
PORTS                                              NAMES
0.0.0.0:59961->8001/tcp, 0.0.0.0:59962->9229/tcp   nodequiz_ws_1
0.0.0.0:59956->8001/tcp, 0.0.0.0:59957->9229/tcp   nodequiz_ws_2
0.0.0.0:59958->8001/tcp, 0.0.0.0:59959->9229/tcp   nodequiz_ws_3
0.0.0.0:59952->8000/tcp, 0.0.0.0:59953->9229/tcp   nodequiz_web_1
0.0.0.0:59954->8000/tcp, 0.0.0.0:59955->9229/tcp   nodequiz_web_2
0.0.0.0:5432->5432/tcp                             dbserver
0.0.0.0:59951->8080/tcp                            nodequiz_adminer_1
0.0.0.0:80->80/tcp, 0.0.0.0:8080->8080/tcp         nodequiz_reverse-proxy_1
```

You can view the web pages on `nodequiz_web_1` by loading <http://localhost:59961/>

Similarly, you can debug the code on the same server at <http://localhost:59962/>. For example, open <chrome://inspect/> in Google Chrome, click **Configure** next to **Discover network targets** and add `localhost:59962`.


## Launch in production mode

Run the following command from the project root directory (`nodequiz`) to start all servers in production mode:

```sh
docker-compose -f ./docker-compose-production.yml up
```

*Note: Docker Compose mounts the `./libshared` directory into both the `web` and `ws` containers. To create stand-alone containers, you should must copy this directory into the `web` and `ws` directories.*

Then open <http://quiz.localhost/> in your browser.



## Stop all services

Stop the applications from the same directory using the command:

```sh
docker-compose down
```
