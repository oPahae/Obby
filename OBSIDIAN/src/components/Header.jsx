import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Header({ onToggleSidebar }) {

  const router = useRouter();
  useEffect(() => {
    if(router.pathname.split("/")[1] === "_error")
      window.location.href = "/"
  })

  return (
    <header className="flex justify-between md:justify-center items-center p-4 bg-black text-white shadow-lg transition duration-300">
      <button
        className="ml-3 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition duration-300 md:hidden"
        onClick={onToggleSidebar}
      >
        <img
          src="/menu.png"
          alt="Sidebar Toggle"
          className="h-6 w-6"
        />
      </button>

      <h1 className="text-2xl font-bold">{router.pathname == "/" ? "Home" : router.pathname.split("/")[1]}</h1>
    </header>
  );
}
