import { FastifyReply, FastifyRequest } from "fastify";

export async function checkSessionIdExists(
  req: FastifyRequest,
  reply: FastifyReply
) {
  let sessionId = req.cookies.sessionId;

  if (!sessionId) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
}
