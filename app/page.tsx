"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export default function Home() {
  const users = useQuery(api.crud.users.get) || [];
  const createUser = useMutation(api.crud.users.create);
  const deleteUser = useMutation(api.crud.users.deleteOne);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleCreate = async () => {
    if (
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      password.trim()
    ) {
      await createUser({
        item: {
          firstName,
          lastName,
          email,
          password,
          createdAt: Date.now(),
        },
      });

      // reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <h1> Hello landing page</h1>
    // <main className="p-4">
    //   <h1 className="text-2xl font-bold mb-4">
    //     Hello from User App with Convex
    //   </h1>

    //   {/* Create Form */}
    //   <div className="mb-4 flex flex-col gap-2 max-w-sm">
    //     <input
    //       type="text"
    //       value={firstName}
    //       onChange={(e) => setFirstName(e.target.value)}
    //       className="border p-2"
    //       placeholder="First name"
    //     />
    //     <input
    //       type="text"
    //       value={lastName}
    //       onChange={(e) => setLastName(e.target.value)}
    //       className="border p-2"
    //       placeholder="Last name"
    //     />
    //     <input
    //       type="email"
    //       value={email}
    //       onChange={(e) => setEmail(e.target.value)}
    //       className="border p-2"
    //       placeholder="Email"
    //     />
    //     <input
    //       type="password"
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //       className="border p-2"
    //       placeholder="Password"
    //     />
    //     <button
    //       onClick={handleCreate}
    //       className="bg-blue-500 text-white p-2 rounded"
    //     >
    //       Add User
    //     </button>
    //   </div>

    //   {/* User List */}
    //   {/* User Creation Form */}

    //   <form className="mb-4 flex flex-col gap-2 max-w-sm">
    //     <input
    //       type="text"
    //       value={firstName}
    //       onChange={(e) => setFirstName(e.target.value)}
    //       className="border p-2"
    //       placeholder="First name"
    //     />
    //     <input
    //       type="text"
    //       value={lastName}
    //       onChange={(e) => setLastName(e.target.value)}
    //       className="border p-2"
    //       placeholder="Last name"
    //     />
    //     <input
    //       type="email"
    //       value={email}
    //       onChange={(e) => setEmail(e.target.value)}
    //       className="border p-2"
    //       placeholder="Email"
    //     />
    //     <input
    //       type="password"
    //       value={password}
    //       onChange={(e) => setPassword(e.target.value)}
    //       className="border p-2"
    //       placeholder="Password"
    //     />
    //     <button
    //       onClick={handleCreate}
    //       className="bg-blue-500 text-white p-2 rounded"
    //     >
    //       Add User
    //     </button>
    //   </form>

    //   <ul>
    //     {users.map((user) => (
    //       <li key={user._id} className="flex items-center mb-2">
    //         <span>
    //           {user.firstName} {user.lastName} ({user.email})
    //         </span>
    //         <button
    //           onClick={() => deleteUser({ id: user._id })}
    //           className="ml-auto bg-red-500 text-white p-1 rounded"
    //         >
    //           Delete
    //         </button>
    //       </li>
    //     ))}
    //   </ul>
    // </main>
  );
}
