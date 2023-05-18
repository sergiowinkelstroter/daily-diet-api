import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "node:crypto";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function usersRouter(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const { sessionId } = req.cookies;

      const user = await knex("users").where({ id: sessionId }).select();

      return {
        user,
      };
    }
  );

  app.post("/", async (req, reply) => {
    const createUserSchema = z.object({
      name: z.string(),
      picture_profile: z.string(),
    });

    const { name, picture_profile } = createUserSchema.parse(req.body);

    const id = randomUUID();
    await knex("users").insert({
      id,
      name,
      picture_profile,
    });

    reply.cookie("sessionId", id, {
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return reply.status(201).send();
  });
}
