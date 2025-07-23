import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { atomWithQuery, queryClientAtom } from "jotai-tanstack-query";
import { useAtom, Provider } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import React from "react"; // Make sure React is imported

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
      refetchOnWindowFocus: false, // Optional: prevent refetch on window focus for this example
    },
  },
});

// Define an atomWithQuery
const usersAtom = atomWithQuery(() => ({
  queryKey: ["users"],
  queryFn: async () => {
    // Simulate an API call
    console.log("Fetching users...");
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
    return [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
      { id: 3, name: "Charlie" },
    ];
  },
}));

// Hydrate the queryClientAtom with the QueryClient instance
const HydrateAtoms = ({ children }: { children: React.ReactNode }) => {
  // `useHydrateAtoms` must be called inside a component.
  // It takes an array of [atom, value] pairs to hydrate.
  useHydrateAtoms([[queryClientAtom, queryClient]]);
  return <>{children}</>; // Render children after hydration
};

function UserList() {
  const [{ data: users, isPending, isError, error }] = useAtom(usersAtom);

  if (isPending) return <div>Loading users...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user: any) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

function AnotherComponentUsingUsers() {
  const [{ data: users, isPending, isError }] = useAtom(usersAtom);
  // This will likely get cached data immediately if UserList already fetched it
  if (isPending) return <p>Loading user count...</p>;
  if (isError) return <p>Error loading user count.</p>;
  return <p>Total users: {users.length}</p>;
}

function App() {
  return (
    // QueryClientProvider should wrap your application to provide the QueryClient
    <QueryClientProvider client={queryClient}>
      {/* Jotai's Provider is needed for Jotai atoms to work */}
      <Provider>
        {/* HydrateAtoms sets the initial value for queryClientAtom */}
        <HydrateAtoms>
          <UserList />
          {/* Another component using the same usersAtom will benefit from the cache */}
          <AnotherComponentUsingUsers />
        </HydrateAtoms>
      </Provider>
    </QueryClientProvider>
  );
}

export default App;
