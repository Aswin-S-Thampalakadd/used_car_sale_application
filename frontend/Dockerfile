FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY public ./public
COPY src    ./src

ARG REACT_APP_API_URL
ARG REACT_APP_RAZORPAY_KEY_ID

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_RAZORPAY_KEY_ID=$REACT_APP_RAZORPAY_KEY_ID

RUN npm run build

FROM nginx:1.27-alpine AS runner

RUN addgroup --system --gid 1001 nginx-app \
 && adduser  --system --uid 1001 --ingroup nginx-app appuser

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R appuser:nginx-app /usr/share/nginx/html \
 && chown -R appuser:nginx-app /var/cache/nginx       \
 && chown -R appuser:nginx-app /var/log/nginx         \
 && touch /var/run/nginx.pid                          \
 && chown appuser:nginx-app /var/run/nginx.pid

USER appuser

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
