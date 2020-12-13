# Note store

## How to use

### Start note-store backend instance

```bash
$ git clone git@github.com:EliseevNP/note-store.git
$ cd note-store
$ npm i
$ docker-compose -f development.docker-compose.yml up -d mysql redis
$ npm run setup-db-scheme
$ docker-compose -f development.docker-compose.yml up -d app
```

Now note-store backend is running, and you can use it by sending requests to the localhost:3000

### Create documentation

```bash
$ npm run doc
```

Open /path/to/note-store/docs/index.html in your browser

## Tests

```bash
$ docker-compose -f development.docker-compose.yml stop app redis mysql
$ docker-compose -f testing.docker-compose.yml up -d mysql redis
$ npm run test:integration
```

## DB credentials

> for databases running via development.docker-compose.yml

- MYSQL_HOST=localhost
- MYSQL_PORT=3306
- MYSQL_USER=root
- MYSQL_PASSWORD=root_password
- MYSQL_DATABASE=notes
- REDIS_HOST=localhost
- REDIS_PORT=6379
