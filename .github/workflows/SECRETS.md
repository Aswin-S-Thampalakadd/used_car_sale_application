# Required GitHub Secrets

Add all secrets at **Settings → Secrets and variables → Actions** in your GitHub repository.
Secrets marked *(environment)* must be added inside a `production` environment
(**Settings → Environments → production → Add secret**) so they are only available
to the CD deploy job.

---

## Deployment infrastructure

| Secret | Description | Example |
|---|---|---|
| `DEPLOY_HOST` | IP address or hostname of the production server | `123.45.67.89` |
| `DEPLOY_USER` | SSH username on the production server | `ubuntu` |
| `DEPLOY_SSH_KEY` | Private SSH key (entire PEM file contents) — the matching public key must be in `~/.ssh/authorized_keys` on the server | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DEPLOY_PORT` | SSH port (optional, defaults to 22) | `22` |

---

## Application runtime

These are passed as environment variables to the backend container at deploy time.

| Secret | Description |
|---|---|
| `POSTGRES_PASSWORD` | PostgreSQL superuser password |
| `JWT_ACCESS_SECRET` | Strong random string for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Strong random string for signing refresh tokens (min 32 chars) |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL (default `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (default `30d`) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | Razorpay live key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay live key secret |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port (usually `587`) |
| `SMTP_USER` | SMTP login username / email address |
| `SMTP_PASS` | SMTP password or app password |
| `APP_URL` | Full public URL of the app e.g. `https://wheelzloop.com` |
| `CORS_ORIGINS` | Comma-separated allowed origins e.g. `https://wheelzloop.com` |

---

## Frontend build

These are baked into the React bundle at image build time by the CD workflow.

| Secret | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL e.g. `https://api.wheelzloop.com/api/v1` |
| `REACT_APP_RAZORPAY_KEY_ID` | Razorpay **live** publishable key ID |

---

## Automatic secret — no action needed

| Secret | Description |
|---|---|
| `GITHUB_TOKEN` | Provided automatically by GitHub Actions — used to push images to GHCR |

---

## Generating a strong secret

```bash
openssl rand -base64 48
```

## Setting up the production server

Before the first deploy the server needs Docker and Docker Compose installed,
and the deploy directory created:

```bash
sudo apt-get update && sudo apt-get install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
sudo mkdir -p /opt/used-car-app
sudo chown $USER:$USER /opt/used-car-app
```
