import { getUser } from "@/lib/auth";

export async function CurrentSessionHelper() {
  const user = await getUser();

  return (
    <p className="text-white text-lg">Current user:{user.data.user?.email}</p>
  );
}
