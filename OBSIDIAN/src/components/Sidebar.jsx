import Link from 'next/link';
import { useRouter } from 'next/router';
import sidebarElements from './sidebarElements';
import "animate.css"

export default function Sidebar({ opened }) {
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
      router.push('/Login');
    }
  }

  return (
    <div
      className={`absolute md:fixed top-[64px] left-0 animate__animated animate__fadeInDown ${
        opened ? 'h-auto' : 'h-0'
      } w-full md:w-64 md:h-screen md:top-0 md:left-0 transition-all overflow-hidden bg-black text-white shadow-2xl backdrop-blur-lg z-40`}
    >
      <h2 className="text-3xl font-extrabold p-6 text-center border-b border-indigo-600 md:border-none uppercase tracking-widest drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">
        Obsidian
      </h2>
      <nav className={`mt-6 md:mt-0 flex flex-col`}>
        
        {sidebarElements.map(e => (
          <Link href={e.link} key={e.id}>
            <div className="flex items-center px-6 py-4 hover:bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:rotate-2">
              <img
                src={e.img}
                className="h-6 w-6 mr-3 drop-shadow-lg"
              />
              <span className="text-lg font-medium">{e.name}</span>
            </div>
          </Link>
        ))}

        <button
          className="flex items-center px-6 py-4 mt-6 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg w-full text-left"
          onClick={() => handleLogout()}
        >
          <img
            src="/logout.png"
            alt="Logout"
            className="h-6 w-6 mr-3 drop-shadow-lg"
          />
          <span className="text-lg font-medium">Logout</span>
        </button>
      </nav>
    </div>
  );
}