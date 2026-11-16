# Kubernetes

Let's assume current k8s kube config file saved as `k8s-ever-kubeconfig.yaml`

## Verify connectivity

kubectl --kubeconfig="k8s-ever-kubeconfig.yaml" get nodes

## Deploy

-   To Deploy

`kubectl --kubeconfig="k8s-ever-kubeconfig.yaml" --context do-sfo2-k8s-ever apply -f k8s-manifest.yaml`

Note: it assume we have context called `do-sfo2-k8s-ever` defined already

-   To Describe Deployment

`kubectl describe deployment --kubeconfig="k8s-ever-kubeconfig.yaml"`

-   To Redeploy (if use latest docker images versions)

`kubectl --kubeconfig="k8s-ever-kubeconfig.yaml" --context do-sfo2-k8s-ever rollout restart -f k8s-manifest.yaml`

## Health probes

The API exposes two unauthenticated endpoints on the GraphQL/HTTP port (`8443`, `GQLPORT`):

| Endpoint                | Meaning                                                                                       | Responses                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `GET /api/health`       | Liveness: the process is up and serving requests. Does not depend on the database.            | `200` with `{ status, checks, uptimeSeconds }`                    |
| `GET /api/health/ready` | Readiness: the API can serve traffic; `200` only while the MongoDB connection is established. | `200`, or `503` with the same body while MongoDB is not connected |

Both send `Cache-Control: no-store` and never create a session (the session middleware skips them). The session middleware runs with `saveUninitialized: false`, so no other cookieless request creates a session either; nothing in the API reads `req.session` (authentication is Passport/JWT).

The API image defines a Docker `HEALTHCHECK` that calls `/api/health` (interval 30s, timeout 5s, start period 90s, 3 retries).

Recommended Kubernetes probe settings for the API container. The demo deployment (the `ever-demo-api` container in `k8s-manifest.demo.yaml`, applied by `.github/workflows/deploy-do.yml`) defines exactly these probes. Use the same settings wherever your own API `Deployment` is defined:

```yaml
startupProbe:
    httpGet: { path: /api/health, port: 8443 }
    periodSeconds: 5
    failureThreshold: 30 # up to ~150s to boot
livenessProbe:
    httpGet: { path: /api/health, port: 8443 }
    periodSeconds: 20
    timeoutSeconds: 5
    failureThreshold: 3
readinessProbe:
    httpGet: { path: /api/health/ready, port: 8443 }
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3
```

The examples use `8443`, the default `GQLPORT`. If the API is configured with a different `GQLPORT`, set every probe `port` (and the container port) to that same value, otherwise the startup probe fails and the container is restarted. The Docker `HEALTHCHECK` reads `GQLPORT` itself, so it needs no change.

The liveness probe tolerates about 60s of failures (3 x 20s) and, being independent of MongoDB, does not restart the pod during a short database blip; the readiness probe only takes the pod out of the Service meanwhile.

Do not point the liveness probe at `/api/health/ready`: a database outage would then restart every API pod instead of just removing them from the Service.

## Monitoring

See <https://marketplace.digitalocean.com/apps/kubernetes-monitoring-stack>

`kubectl --kubeconfig="k8s-ever-kubeconfig.yaml" port-forward svc/kube-prometheus-stack-grafana 8090:80 -n kube-prometheus-stack`

Your Grafana instance will now be available at http://localhost:8090.

Default credentials:

Username: admin
Password: prom-operator

Note: change password after login!

`kubectl --kubeconfig="k8s-ever-kubeconfig.yaml" port-forward svc/kube-prometheus-stack-prometheus 9090 -n kube-prometheus-stack`

Your Prometheus instance will now be available at http://localhost:9090.

## Links

-   [DO, WebSockets, Load Balancers](https://medium.com/swlh/how-to-use-web-sockets-socket-io-with-digital-ocean-load-balancers-and-kubernetes-dok8s-with-e4dd5531c67e)
-   [Load Balancers Configs in DO](https://www.digitalocean.com/docs/kubernetes/how-to/configure-load-balancers)
-   [K8s Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/#ingress-controllers)
-   [K8s Ingress with Nginx + SSL LetsEncrypt](https://www.digitalocean.com/community/tutorials/how-to-set-up-an-nginx-ingress-with-cert-manager-on-digitalocean-kubernetes)
-   [Github Actions with DO](https://github.com/do-community/example-doctl-action/blob/master/.github/workflows/workflow.yaml)
