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

  it("should be able to create a new meal", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({ name: "sergio", picture_profile: "aaaaaaa" })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .send({
        name: "arroz",
        description: "aaaaaaa",
        hour: "16:00",
        inside_diet: true,
        date: "2023-05-18",
      })
      .set("Cookie", cookies)
      .expect(201);
  });

  it("should be able to update meal", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({ name: "sergio", picture_profile: "aaaaaaa" });

    const cookies = createUserResponse.get("Set-Cookie");

    const createMealResponse = await request(app.server)
      .post("/meals")
      .send({
        name: "arroz",
        description: "aaaaaaa",
        hour: "16:00",
        inside_diet: true,
        date: "2023-05-18",
      })
      .set("Cookie", cookies)
      .expect(201);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = listMealsResponse.body.meals[0].id;

    await request(app.server)
      .put(`/meals/${mealId}`)
      .send({
        name: "arroz",
        description: "aaaaaaa",
        hour: "18:00",
        inside_diet: false,
        date: "2023-05-18",
      })
      .set("Cookie", cookies)
      .expect(201);
  });

  it("should be able to list all meals", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({ name: "sergio", picture_profile: "aaaaaaa" });

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .send({
        name: "arroz",
        description: "aaaaaaa",
        hour: "16:00",
        inside_diet: true,
        date: "2023-05-18",
      })
      .set("Cookie", cookies);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: "arroz",
        description: "aaaaaaa",
      }),
    ]);
  });

  it("should be able to get a specific meal", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({ name: "sergio", picture_profile: "aaaaaaa" })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .send({
        name: "arroz",
        description: "aaaaaaa",
        hour: "16:00",
        inside_diet: true,
        date: "2023-05-18",
      })
      .set("Cookie", cookies);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = listMealsResponse.body.meals[0].id;

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(200);

    expect(getMealResponse.body.meal).toEqual(
      expect.objectContaining({
        name: "arroz",
        description: "aaaaaaa",
        inside_diet: 1,
      })
    );
  });

  it("should be able to delete a specific meal", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({ name: "sergio", picture_profile: "aaaaaaa" })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .send({
        name: "arroz",
        description: "aaaaaaa",
        hour: "16:00",
        inside_diet: true,
        date: "2023-05-18",
      })
      .set("Cookie", cookies);

    const listMealsResponse = await request(app.server)
      .get("/meals")
      .set("Cookie", cookies)
      .expect(200);

    const mealId = listMealsResponse.body.meals[0].id;

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set("Cookie", cookies)
      .expect(204);
  });

  it("should be able to get the summary", async () => {
    const createUserResponse = await request(app.server)
      .post("/users")
      .send({ name: "sergio", picture_profile: "aaaaaaa" })
      .expect(201);

    const cookies = createUserResponse.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .send({
        name: "arroz",
        description: "aaaaaaa",
        hour: "16:00",
        inside_diet: true,
        date: "2023-05-18",
      })
      .set("Cookie", cookies);

    await request(app.server)
      .post("/meals")
      .send({
        name: "arroz",
        description: "aaaaaaa",
        hour: "16:00",
        inside_diet: false,
        date: "2023-05-18",
      })
      .set("Cookie", cookies);

    const summaryResponse = await request(app.server)
      .get("/meals/summary")
      .set("Cookie", cookies);

    expect(summaryResponse.body.summary).toEqual({
      mealsAll: 2,
      mealsInDiet: 1,
      mealOffDiet: 1,
      sequenceInDiet: 1,
    });
  });
});
