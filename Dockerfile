FROM denoland/deno:2.5.6

EXPOSE 3000

WORKDIR /app
USER deno

COPY . .
RUN deno install

CMD ["run", "--allow-env", "--allow-net", "src/main.ts"]
