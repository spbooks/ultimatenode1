# Page hit counter (MySQL native version)

From the project directory, download and start MySQL in a terminal using:

```sh
docker-compose up
```

Install then start the Node.js page hit application in another terminal:

```sh
npm install
npm start
```

Start a web server in another terminal:

```sh
npx small-static-server 8888 ./test
```

Visit <http://localhost:8888/page1.html> or <http://localhost:8888/page2.html> to view the page counter. Refresh the page to see it increase.

To view data, open the Adminer client at <http://localhost:8080/> with the credentials:

* Server: **host.docker.internal** (or your network IP address)
* Username: **pagehituser**
* Password: **pagehitpw**
* Database: **pagehitmysql**


## Shutdown

Stop the Docker MySQL server in a terminal using:

```sh
docker-compose down
```

Press `Ctrl` | `Cmd` + `C` to stop the Node.js application and web server.
