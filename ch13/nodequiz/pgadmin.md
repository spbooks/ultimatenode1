# Using pgAdmin

[pgAdmin](https://www.pgadmin.org/) is a comprehensive PostgreSQL database management tool which has more features than [Adminer](https://www.adminer.org/). To use pgAdmin instead of - or in addition to - Adminer, add the following lines to the `.env` file:

```ini
# pgadmin access
PGADMIN_LISTEN_PORT=8081
PGADMIN_SERVER_JSON_FILE=/var/lib/pgadmin/servers.json
PGADMIN_DEFAULT_EMAIL=admin@db.com
PGADMIN_DEFAULT_PASSWORD=admin
```

The `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` can be changed to your own credentials.

Then add the following service to the bottom of the `services` section in your `docker-compose.yml` file:

```yml
services:
  # ...

  # pgAdmin database client (1 instance)
  pgadmin:
    image: dpage/pgadmin4
    labels:
      - traefik.http.routers.pgadmin-router.rule=Host(`pgadmin.localhost`)
      - traefik.http.routers.pgadmin-router.service=pgadmin-service
      - traefik.http.services.pgadmin-service.loadbalancer.server.port=8081
    depends_on:
      - postgres
    restart: on-failure
    env_file: .env
    volumes:
      - pgadmin4data:/var/lib/pgadmin
    ports:
      - 8081
```

As well as a `pgadmin4data:` entry in the `volumes:` section:

```yml
volumes:
  # ...
  pgadmin4data:
```

To use pgAdmin:

1. Load <http://pgadmin.localhost/> in a browser.

1. Log on with the email and password set in `.env` (`admin@db.com` / `admin`).

1. Click **Add New Server**.

1. In the **General** tab, enter a connection name such as `quiz`.

1. In the **Connection** tab, enter:

   * **Host name/address:** `dbserver` (or `host.docker.internal` or your PC's IP address)
   * **Port:** `5432`
   * **Username:** `quizuser`
   * **Password:** `quizpass` (and check **Save Password**)

1. Click **Save** and connect to the database server.

These credentials will be saved when you start the server again.
