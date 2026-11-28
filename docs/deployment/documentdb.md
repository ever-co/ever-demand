# Running Ever Demand on DocumentDB

[DocumentDB](https://github.com/documentdb/documentdb) is an open-source (MIT) document database built on PostgreSQL, from the Linux Foundation. It speaks the MongoDB wire protocol through its gateway. Ever Demand runs on it **as well as** on MongoDB: the API uses the same MongoDB driver (Mongoose 9 / Node driver 7), and only `DB_URI` and `DB_NAME` change. `DB_NAME` must name the same database as the path of `DB_URI`: the API passes it as `dbName`, which wins over that path.

Use it when you would rather run PostgreSQL than MongoDB, for example because your team already operates PostgreSQL.

## Verified

Ever Demand `develop` was tested on 2026-11-28 against **DocumentDB 1.2.0** (image `ghcr.io/documentdb/documentdb/documentdb-local`, gateway on port 10260). The gateway reports wire version 21, as MongoDB 7.0.

| Suite                                                                       | DocumentDB 1.2.0                         | MongoDB 8 |
| --------------------------------------------------------------------------- | ---------------------------------------- | --------- |
| Core API e2e (Jest), single tenant                                          | 52 / 52                                  | 52 / 52   |
| Core API e2e (Jest), multi-tenant isolation                                 | 56 / 56                                  | 56 / 56   |
| Playwright, API                                                             | 19 / 19                                  | 19 / 19   |
| Playwright, admin / shop-web / shop-mobile / merchant / carrier / shop-expo | 84 passed, 2 skipped                     | the same  |
| API Docker image through `docker-compose.documentdb.yml`                    | boots, `/api/health/ready` 200           | n/a       |
| `mongodump` / `mongorestore` of the database                                | all documents and indexes (2dsphere too) | n/a       |

The 2 skipped Playwright specs skip on MongoDB too: one needs a Google Maps key, the other runs only while the API is down.

What Ever Demand uses and DocumentDB serves:

- `$near` with a `2dsphere` index (stores and invites near a customer);
- aggregation with `$lookup` (pipeline form with `$expr`), `$unwind`, `$project`, `$group`, `$cond` and `$toString`;
- `$regex`, `$elemMatch`;
- `findOneAndUpdate`, `insertMany`, `countDocuments`;
- partial unique indexes and compound indexes;
- socket.io and GraphQL subscriptions. These need nothing from the database, because Ever Demand uses **no change streams**.

## Differences to know

- **No compound regular + `2dsphere` indexes.** DocumentDB refuses an index such as `{ tenantId: 1, loc: '2dsphere' }`, so Ever Demand keeps its geo indexes single-field. New entities must do the same: put a `2dsphere` index on the location field alone, and the tenant filter applies on top of `$near`.
- **TLS only.** The gateway always speaks TLS, so give the API a `DB_URI` with `tls=true`:
    - **With a real CA** (production): `DB_SSL_MODE=true` and `DB_CA_CERT=<base64 PEM>`, or `tlsCAFile=<path>` in `DB_URI`.
    - **Local only:** the local image makes a self-signed certificate at first start (`CN=localhost`). Use `tlsAllowInvalidCertificates=true` for it, and nowhere else.
- **No change streams, no `readConcern: snapshot`, collation off by default.** Ever Demand uses none of them. Keep it that way, or test new code on DocumentDB.
- **Usage telemetry.** The local image reports anonymous usage (version, platform) by default. Turn it off with `DOCUMENTDB_USAGE_TELEMETRY=false`; the compose file below does.
- **Users.** The username must not start with `documentdb`, `pg` or `citus`, and a password is required.

## Local: Docker

```bash
docker run -d --name documentdb -p 127.0.0.1:10260:10260 -v documentdb-data:/data \
  -e DOCUMENTDB_USAGE_TELEMETRY=false \
  ghcr.io/documentdb/documentdb/documentdb-local:pg17-1.2.0 \
  --username ever --password '<a password>'
```

Wait for `DocumentDB is ready` in `docker logs documentdb`, then set in `packages/core/.env`:

```ini
DB_URI=mongodb://localhost:10260/ever_development?tls=true&tlsAllowInvalidCertificates=true
DB_NAME=ever_development
DB_USER=ever
DB_PASS=<password>
```

`DB_USER` and `DB_PASS` reach the driver as options, so the password needs no encoding. Credentials inside `DB_URI` (`mongodb://ever:<password>@…`) work too, but then percent-encode the reserved characters of the password (`@ : / ? # [ ] %`) in the URI only, not in the `docker run`.

## Local: Docker Compose

```bash
DOCUMENTDB_PASSWORD='<a password>' docker compose -f docker-compose.yml -f docker-compose.documentdb.yml up
```

`docker-compose.documentdb.yml` replaces the MongoDB service with DocumentDB and points the API at it.

## Tests against DocumentDB

The core e2e suites take any MongoDB-compatible server through `CORE_E2E_MONGO_URL`, query options included:

```bash
pnpm --filter @ever-platform/core build
CORE_E2E_MONGO_URL='mongodb://ever:<password>@localhost:10260/?tls=true&tlsCAFile=<cert.pem>' \
  pnpm --filter @ever-platform/core test:e2e
# multi-tenant isolation suite: test:e2e:mt
```

To get `cert.pem`, copy the self-signed certificate out of the container with `docker cp documentdb:/home/documentdb/.local/state/documentdb-gateway/tls/cert.pem .`.

## Production

**Give DocumentDB its own PostgreSQL. Do not load it into a PostgreSQL that serves other applications.** The reasons:

- DocumentDB needs its extensions in `shared_preload_libraries` (`pg_cron`, `pg_documentdb_core`, `pg_documentdb`), and changing that restarts PostgreSQL.
- Its extensions must be created as superuser.
- Its gateway connects to PostgreSQL as a superuser over localhost with `trust` auth.
- Installing into an existing PostgreSQL cluster is not a documented or supported setup yet (upstream operator issue #315).

There are two ways to run it on Kubernetes:

1. **The DocumentDB image as a StatefulSet** (`documentdb-local`, pinned, for example `pg17-1.2.0`). This is one pod holding PostgreSQL, the extensions and the gateway.
    - Mount a certificate (`--cert-path` / `--key-file`, for example from cert-manager).
    - Use a persistent volume for `/data`, and limit network access to port 10260.
    - Back it up with a nightly `mongodump --archive --gzip` to object storage. Restore with `mongorestore` (tested above).
    - This is the engine version Ever Demand was tested on. It runs a single instance, with no replicas.
2. **The [DocumentDB Kubernetes operator](https://github.com/documentdb/documentdb-kubernetes-operator).** It builds on CloudNativePG: for each `DocumentDB` resource it creates its own CNPG cluster (PostgreSQL 18, 1–3 instances), with the gateway as a sidecar.
    - As of operator 1.2.2 (2026-11-25), it still runs engine 1.0.1.
    - It backs up with volume snapshots only (no Barman, no point-in-time recovery yet).
    - Its connection string carries `replicaSet=rs0` next to `directConnection=true`; drop `replicaSet`.

Size it from 2 CPU / 4 GiB as the minimum; upstream recommends 4 CPU / 8 GiB and an SSD for production.

## The API settings

| Variable                    | DocumentDB                                                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `DB_URI`                    | `mongodb://<user>:<password>@<host>:10260/<database>?tls=true` (plus `tlsCAFile=` or `tlsAllowInvalidCertificates=true` as above) |
| `DB_NAME`                   | the database name, as in `DB_URI`                                                                                                 |
| `DB_SSL_MODE`, `DB_CA_CERT` | optional: TLS with the CA given in base64 (both connections, Mongoose and TypeORM)                                                |
| `DB_USER`, `DB_PASS`        | the credentials, passed as options (no URI encoding needed); leave empty when they are in `DB_URI`                                |
