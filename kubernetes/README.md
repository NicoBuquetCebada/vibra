# Despliegue y configuración de Kubernetes — Vibra

Este directorio contiene todos los manifiestos y recursos necesarios para desplegar la aplicación Vibra sobre un clúster de Kubernetes.

El despliegue se ha realizado de forma local sobre un clúster creado con **Kind (Kubernetes IN Docker)** sobre una máquina Rocky Linux minimal, simulando un entorno de producción real con contenedores independientes para el backend, frontend y la base de datos.

Las imágenes indicadas en los deployment son las imagenes del código final de la aplicación.

---

### ⚙️ Tecnologías de despliegue

- Kubernetes v1.29+
- Kind (Kubernetes IN Docker)
- Podman (como motor de contenedores)
- Rocky Linux minimal
- Manifiestos YAML

---

### 🔧 Requisitos previos

- Tener instalado Kind y Kubectl.
- Tener instalado Podman o Docker.
- Pasar los manifiestos YAML a la ubicación del cluster

---

## 🚀 Instrucciones de despliegue

### 1️⃣ Crear el clúster de Kubernetes con Kind

```bash
$> cat <<EOF | kind create cluster --name vibra --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
  - containerPort: 8080
    hostPort: 8080
    protocol: TCP
EOF

$> kubectl create secret generic jwt-secret --from-k exefile=privateKey.pem --from-file=publicKey.pem apply -f https://kind.sigs.k8s.io/examples/ingress/deploy-ingress-nginx.yaml

$> kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```
---

### 2️⃣ Crear los Kubernetes resources

#### Creación de claves para la autenticación JWT

📂 kubernetes/backend
```bash
$> openssl genpkey -algorithm RSA -out private-key.pem -pkeyopt rsa_keygen_bits:2048

$> openssl rsa -pubout -in private-key.pem -out public-key.pem

$> kubectl create secret generic jwt-secret --from-k exefile=privateKey.pem --from-file=publicKey.pem
```

#### Creación del namespace del proyecto y los resources

📂 kubernetes/
```bash
$> kubectl config set-context --current --namespace=NOMBRE_NUEVO_NAMESPACE

$> kubectl apply -f backend/
$> kubectl apply -f frontend/
$> kubectl apply -f db/
```
