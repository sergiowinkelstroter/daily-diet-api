import request from "supertest";
import { app } from "../src/app";
import { it, beforeAll, afterAll, describe, expect, beforeEach } from "vitest";
import { execSync } from "child_process";

describe("Users routes", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should be able to create a new user", async () => {
    await request(app.server)
      .post("/users")
      .send({ name: "sergio", picture_profile: "aaaaaaa" })
      .expect(201);
  });

  it("should be able to get users", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({ name: "sergio", picture_profile: "aaaaaaa" });

    const cookies = createUserResponse.get("Set-Cookie");

    const userResponse = await request(app.server)
      .get("/users")
      .set("Cookie", cookies);

    expect(userResponse.body.user).toEqual([
      expect.objectContaining({
        name: "sergio",
        picture_profile: "aaaaaaa",
      }),
    ]);
  });
});
