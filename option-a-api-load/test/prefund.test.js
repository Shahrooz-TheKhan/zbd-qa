const request = require("supertest");
const app = require("../src/server");

describe("POST /prefund", () => {
  it("accepts a valid prefund (>= 100,000 sats) and returns updated balance", async () => {
    const res = await request(app)
      .post("/prefund")
      .send({ developerId: "dev-1", amountSats: 100000 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ developerId: "dev-1", balanceSats: 100000 });
  });

  it("rejects prefund below minimum (100,000 sats)", async () => {
    const res = await request(app)
      .post("/prefund")
      .send({ developerId: "dev-2", amountSats: 99999 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "minimum prefund is 100,000 sats" });
  });

  it("rejects missing developerId", async () => {
    const res = await request(app)
      .post("/prefund")
      .send({ amountSats: 100000 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "developerId and integer amountSats required" });
  });

  it("accumulates balance for the same developer across multiple prefunds", async () => {
    // First prefund
    await request(app)
      .post("/prefund")
      .send({ developerId: "dev-acc", amountSats: 100000 });

    // Second prefund
    const res = await request(app)
      .post("/prefund")
      .send({ developerId: "dev-acc", amountSats: 150000 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ developerId: "dev-acc", balanceSats: 250000 });
  });
});
