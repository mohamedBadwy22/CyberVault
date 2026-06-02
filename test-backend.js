import fetch from 'node-fetch';

async function test() {
  try {
    // 1. Login to get token
    console.log("Logging in...");
    // We don't have real credentials, but we can try to hit the login endpoint with dummy to see if it's reachable at all
    const res = await fetch("https://api.cybervault.systems/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankUserId: "invalid", password: "invalid" })
    });
    const body = await res.json();
    console.log("Login response:", res.status, body);

  } catch (e) {
    console.error("Fetch failed:", e);
  }
}

test();
