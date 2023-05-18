import fastify from "fastify";
import cookie from "@fastify/cookie";
import { usersRouter } from "./routes/users";
import { mealsRoutes } from "./routes/meals";

export const app = fastify();

app.register(cookie);

app.register(usersRouter, {
  prefix: "users",
});

app.register(mealsRoutes, {
  prefix: "meals",
});
