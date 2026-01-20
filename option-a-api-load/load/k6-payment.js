import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 75,
  duration: "20s",
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const DEVELOPER_ID = "dev-load";
const USER_ID = "user-load";

/**
 * Runs once before virtual users start.
 * Prefund so /pay requests have balance to draw from.
 */
export function setup() {
  const payload = JSON.stringify({ developerId: DEVELOPER_ID, amountSats: 20000000 });
  const params = { headers: { "Content-Type": "application/json" } };
  const res = http.post(`${BASE_URL}/prefund`, payload, params);

  check(res, { "prefund status is 200": (r) => r.status === 200 });
}

export default function () {
  const payload = JSON.stringify({
    developerId: DEVELOPER_ID,
    userId: USER_ID,
    amountSats: 1000,
  });

  const params = { headers: { "Content-Type": "application/json" } };
  const res = http.post(`${BASE_URL}/pay`, payload, params);

  // Under load, we care that requests keep succeeding (or we observe failure modes)
  check(res, { "pay status is 200": (r) => r.status === 200 });

  sleep(0.1);
}

