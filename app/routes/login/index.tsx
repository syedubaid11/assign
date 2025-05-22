// import { Form, json, useActionData } from "@remix-run/react"
// import type { ActionFunctionArgs } from "@remix-run/node";
// import { client } from "~/utils/directus.server";  //importing the client from directus client which we initiliased using sdk
// import { useEffect } from "react";


// export const action = async ({ request }: ActionFunctionArgs) => {
//     const formData=await request.formData();    
//     const email = formData.get("email");
//     const password = formData.get("password");

// if (typeof email !== "string" || typeof password !== "string") {
//     return json({ error: "Invalid email or password" }, { status: 400 });
// }

// try {
//     const result = await client.login(email, password);  //calling in the directus sdk to login
//     const access_token = result.access_token;            //getting the access_token
//     console.log(access_token);

//     return json({ access_token });
// } catch {
//     return json({ error: "Login failed" }, { status: 400 });
// }

// }

// export default function Login(){
//     const actionData=useActionData<typeof action>();

//     useEffect(()=>{
//         //@ts-ignore
//         if(actionData?.access_token){
//             //@ts-ignore
//             localStorage.setItem('directus_token',actionData.access_token)
//             window.location.href="/dashboard";
//         }

//     },[actionData])

//     return(
//         <div>
//             <Form method="post" className="flex flex-col gap-4">
//                 <input name="email" placeholder="Email" required/>
//                 <input name="password" placeholder='Password' required/>
//                 <button type="submit">Login</button>
//             </Form>

//         </div>
//     )
// }

import axios from 'axios';
import React, { useState } from "react";
import { createDirectus, authentication, rest } from "@directus/sdk";
import { useNavigate } from "@remix-run/react";

const client = createDirectus("http://128.140.75.83:2221")
  .with(authentication("json"))
  .with(rest());

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate=useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const result = await client.login(email, password);
      // saving token in localstorage
      localStorage.setItem("directus_token", result.access_token ?? "");
      alert("Logged in successfully!");
      navigate('/dashboard') //redirected to dashboard upon succesful login
    } catch (err) {
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        <button type="submit" style={{ padding: 10, width: "100%" }}>
          Login
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
    </div>
  );
}

