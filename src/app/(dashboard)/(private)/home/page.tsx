import Sidebar from "@/components/Sidebar"; // <-- import Sidebar
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = cookies();
  const cookie = (await cookieStore).get("isLoggedIn");

  if (!cookie || cookie.value !== "true") {
    redirect("/login");
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className="flex-1 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/home.jpg')" }}
      >
        <div className="h-full flex items-center justify-center bg-black/40">
          <h1 className="text-white text-4xl font-bold">
            Welcome to Cinema Booking
          </h1>
        </div>
      </main>
    </div>
  );
}
