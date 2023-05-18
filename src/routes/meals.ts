import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { checkSequenceMealsInDiet } from "../middlewares/check-sequence-meals-in-diet";
import { parse, parseISO } from "date-fns";
import { convertTimeStringToMinutes } from "../utils/convertTimeStringToMinutes";

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const { sessionId } = req.cookies;

      const meals = await knex("meals").where({ user_id: sessionId }).select();

      return {
        meals,
      };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const { sessionId } = req.cookies;

      const { id } = getMealParamsSchema.parse(req.params);

      const meal = await knex("meals")
        .where({ id, user_id: sessionId })
        .first();

      if (!meal) {
        return reply.status(200).send({});
      }

      return { meal };
    }
  );

  app.get(
    "/summary",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const { sessionId } = req.cookies;

      const mealsAll = await knex("meals")
        .where({ user_id: sessionId })
        .select();

      const mealsInDiet = await knex("meals")
        .where({ inside_diet: true, user_id: sessionId })
        .select();

      const mealsOffDiet = await knex("meals")
        .where({ inside_diet: false, user_id: sessionId })
        .select();

      const sequence = checkSequenceMealsInDiet(mealsAll);

      const summary = {
        mealsAll: mealsAll.length,
        mealsInDiet: mealsInDiet.length,
        mealOffDiet: mealsOffDiet.length,
        sequenceInDiet: sequence,
      };

      return { summary };
    }
  );

  app.post(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const createMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        inside_diet: z.boolean(),
        hour: z.string(),
        date: z.string(),
      });

      const { name, description, inside_diet, hour, date } =
        createMealSchema.parse(req.body);

      let sessionId = req.cookies.sessionId;

      const hourTime = convertTimeStringToMinutes(hour);

      if (!sessionId) {
        return reply;
      }

      await knex("meals").insert({
        id: randomUUID(),
        name,
        description,
        inside_diet,
        date: parseISO(date),
        hour: hourTime,
        user_id: sessionId,
      });

      return reply.status(201).send();
    }
  );

  app.put(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const { sessionId } = req.cookies;

      const updateMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        inside_diet: z.boolean(),
        hour: z.string(),
        date: z.string(),
      });

      const { name, description, inside_diet, hour, date } =
        updateMealSchema.parse(req.body);

      const { id } = getMealParamsSchema.parse(req.params);

      const hourTime = convertTimeStringToMinutes(hour);

      await knex("meals")
        .where({ id: id, user_id: sessionId })
        .update({
          name,
          description,
          inside_diet,
          date: parseISO(date),
          hour: hourTime,
        });

      return reply.status(201).send();
    }
  );

  app.delete(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { sessionId } = req.cookies;

      const { id } = getMealParamsSchema.parse(req.params);

      await knex("meals").where({ id: id, user_id: sessionId }).delete();

      return reply.status(204).send();
    }
  );
}
