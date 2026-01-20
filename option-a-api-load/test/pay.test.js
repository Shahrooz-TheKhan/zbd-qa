const request = require("supertest");
const app = require("../src/server");

describe("POST /pay", () => {
  it("pays successfully and deducts amount + 2% fee from developer balance", async () => {
    // prefund the pool first
    await request(app)
      .post("/prefund")
      .send({ developerId: "dev-pay-1", amountSats: 100000 });

    // pay 1000 sats (fee should be floor(1000 * 0.02) = 20)
    const res = await request(app)
      .post("/pay")
      .send({ developerId: "dev-pay-1", userId: "user-1", amountSats: 1000 });

    // Assert: success response and correct accounting
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("SUCCESS");
    expect(res.body.feeSats).toBe(20);
    expect(res.body.totalCostSats).toBe(1020);
    expect(res.body.developerBalanceSats).toBe(100000 - 1020);
  });

  it("rejects missing required fields", async () => {
    const res = await request(app)
      .post("/pay")
      .send({ developerId: "dev-x", amountSats: 1000 }); // missing userId

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "developerId, userId and integer amountSats required" });
  });

  it("rejects non-integer amountSats", async () => {
    const res = await request(app)
      .post("/pay")
      .send({ developerId: "dev-x", userId: "user-x", amountSats: 10.5 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "developerId, userId and integer amountSats required" });
  });

  it("rejects amountSats < 1", async () => {
    const res = await request(app)
      .post("/pay")
      .send({ developerId: "dev-x", userId: "user-x", amountSats: 0 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "amountSats must be >= 1" });
  });

  it("returns insufficient balance when developer pool cannot cover amount + fee", async () => {
    // Prefund exactly 100,000 sats
    await request(app)
      .post("/prefund")
      .send({ developerId: "dev-pay-2", amountSats: 100000 });

    // Attempt a payment that will exceed the balance once fee is included:
    // amount=100000 -> fee=2000 -> total=102000 > 100000
    const res = await request(app)
      .post("/pay")
      .send({ developerId: "dev-pay-2", userId: "user-2", amountSats: 100000 });

    expect(res.status).toBe(402);
    expect(res.body).toEqual({ error: "insufficient developer balance" });
  });
});
