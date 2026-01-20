const request = require("supertest");
const app = require("../src/server");

describe("GET /health", () => {
  it("returns ok=true when the service is healthy", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
