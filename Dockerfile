FROM denoland/deno:2.5.6

ARG GIT_COMMIT
ARG VERSION

EXPOSE 3000

WORKDIR /app
RUN chown -R deno:deno /app
USER deno

# Get the git commit hash
COPY . .
RUN echo "GIT_COMMIT=${GIT_COMMIT:-$(git rev-parse HEAD)}" > .env
RUN echo "VERSION=${VERSION}" >> .env

RUN deno install

CMD ["run", "--allow-env", "--env-file", "--allow-net", "src/main.ts"]
