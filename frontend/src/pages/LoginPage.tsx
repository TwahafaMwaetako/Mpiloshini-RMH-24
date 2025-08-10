function LoginPage() {
  return (
    <div className="max-w-md mx-auto p-6 rounded-xl shadow-[6px_6px_12px_#bebebe,_-6px_-6px_12px_#ffffff]">
      <h2 className="text-xl font-semibold mb-4">Login</h2>
      <input
        type="email"
        placeholder="Email"
        className="w-full mb-3 p-4 rounded-lg shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]"
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full mb-4 p-4 rounded-lg shadow-[inset_6px_6px_12px_#bebebe,_inset_-6px_-6px_12px_#ffffff]"
      />
      <button className="w-full py-3 rounded-lg font-medium text-white bg-[#5a7d9a]">Sign In</button>
    </div>
  )
}

export default LoginPage
