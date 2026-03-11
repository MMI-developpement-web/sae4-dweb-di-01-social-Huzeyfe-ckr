import { useNavigate } from "react-router-dom";
import Footer from './ui/Footer'
import Post from './ui/Post'
import Header from './ui/Header'


const POST_IMG = "https://www.figma.com/api/mcp/asset/ef365f0c-1f67-46a3-abac-ee3ac9aeed23";

const posts = [
  {
    id: 1,
    name: "Huzeyfe",
    handle: "@Huzeyfecakir",
    time: "3h",
    text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,
    image: POST_IMG,
  },
  {
    id: 2,
    name: "Huzeyfe",
    handle: "@Huzeyfecakir",
    time: "3min",
    text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
    image: POST_IMG,
  },
];

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <Header />
      <div className="max-w-md mx-auto px-4 pt-4">
        {posts.map((p) => (
          <Post key={p.id} name={p.name} handle={p.handle} time={p.time} text={p.text} image={p.image} />
        ))}
      </div>

      {/* Floating action button */}
      <button onClick={() => navigate('/post')} className="fixed bottom-20 right-6 bg-sky-500 w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white">+</button>

      {/* Footer (replaces bottom nav) */}
      <Footer />
    </div>
  );
}
