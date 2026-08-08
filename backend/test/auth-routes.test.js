import assert from "node:assert/strict";
import test from "node:test";
import app from "../src/app.js";

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

const post = async (path, body) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  return { response, payload: await response.json() };
};

test("health endpoint is available", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(payload, { success: true, message: "API Running" });
});

test("login rejects an empty request before contacting Cognito", async () => {
  const { response, payload } = await post("/api/auth/login", {
    username: "",
    password: ""
  });

  assert.equal(response.status, 400);
  assert.equal(payload.success, false);
  assert.equal(payload.message, "Validation failed");
  assert.deepEqual(
    payload.errors.map((error) => error.field).sort(),
    ["password", "username"]
  );
});

test("reset password validates its required values before contacting Cognito", async () => {
  const { response, payload } = await post("/api/auth/reset-password", {
    username: "",
    code: "",
    password: "short"
  });

  assert.equal(response.status, 400);
  assert.equal(payload.success, false);
  assert.equal(payload.message, "Validation failed");
  assert.deepEqual(
    payload.errors.map((error) => error.field).sort(),
    ["code", "password", "username"]
  );
});


test("register validates every visible reference-form field before contacting Cognito", async () => {
  const { response, payload } = await post("/api/auth/register", {
    firstName: "Varsha",
    lastName: "Yadav",
    email: "varsha@example.com",
    company: "",
    phone: ""
  });

  assert.equal(response.status, 400);
  assert.equal(payload.success, false);
  assert.equal(payload.message, "Validation failed");
  assert.deepEqual(
    payload.errors.map((error) => error.field).sort(),
    ["company", "phone"]
  );
});


test("set-password requires either Cognito challenge session or temporary password", async () => {
  const { response, payload } = await post("/api/auth/set-password", {
    username: "person@example.com",
    newPassword: "Password@123"
  });

  assert.equal(response.status, 400);
  assert.equal(payload.success, false);
  assert.equal(payload.message, "Validation failed");
});
