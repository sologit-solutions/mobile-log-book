FROM denoland/deno:2.5.3

WORKDIR /app

COPY . .

RUN deno i

CMD ["deno", "run", "--allow-net", "--allow-env", "app.js"]