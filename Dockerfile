FROM node:24

ARG GIT_COMMIT
ARG VERSION

EXPOSE 3000

WORKDIR /app
RUN chown -R deno:deno /app
USER node

# Get the git commit hash
COPY . .
RUN echo "GIT_COMMIT=${GIT_COMMIT:-$(git rev-parse HEAD)}" > .env
RUN echo "VERSION=${VERSION}" >> .env
RUN --mount=type=secret,id=github_token,env=GITHUB_TOKEN \ 
    echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" > .npmrc && \
    echo "@kaplego:registry=https://npm.pkg.github.com/" >> .npmrc

RUN npm run ci

CMD ["dist/main.js"]
