'use client';

export default function NavBar() {
  return (
    <>
    <div className=" bg-black">
        <div className="container flex justify-between bg-blue-900">
        {/* NavBar Left Content */}
        <div className="bg-red-300 ms-3 flex items-center justify-between">
            <div className="m-1.5 bg-amber-800">
                <p>icon</p>
            </div>
            <div className="bg-sky-400">
                <p>CyberVault</p>
            </div>
        </div>

        {/* NavBar Center Content */}
        <div className="bg-green-300">
            <ul className="flex gap-3 justify-center items-center">
                <li>Home</li>
                <li>About</li>
                <li>Contact</li>
            </ul>
        </div>

        {/* NavBar Right Content */}
        <div className="bg-yellow-300 me-3">
            <button>Login</button>
        </div>
    </div>
    </div>
    </>
  )
}
