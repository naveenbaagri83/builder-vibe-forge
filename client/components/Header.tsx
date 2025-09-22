import { Link } from "react-router-dom";
import SignInOutButtons from "@/components/SignInOutButtons";

export default function Header() {
  return (
  <header className="w-full bg-transparent text-white shadow-md py-4 absolute top-0 left-0 z-20">
      <nav className="container mx-auto flex justify-between items-center px-6">
  <div className="font-bold text-xl">VIGYAN SETU</div>
        <div className="flex gap-6 items-center">
          <Link to="/" className="hover:text-cyan-300">Home</Link>
          <Link to="/chatbot" className="hover:text-cyan-300">Chat Bot</Link>
          <Link to="/dashboard" className="hover:text-cyan-300">Dashboard</Link>
          <Link to="/articles" className="hover:text-cyan-300">Articles</Link>
          <SignInOutButtons />
        </div>
      </nav>
    </header>
  );
}
