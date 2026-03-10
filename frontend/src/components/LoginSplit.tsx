const imgImg = "https://www.figma.com/api/mcp/asset/ef365f0c-1f67-46a3-abac-ee3ac9aeed23";

export default function LoginSplit(): JSX.Element {
  return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="flex w-full max-w-6xl">
        <div className="w-1/2 flex items-center justify-center">
          <div className="w-72 h-72">
            <img
              src={imgImg}
              alt="logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="w-1/2 flex items-center justify-center">
          <div className="w-96 text-white">
            <h1 className="text-5xl font-extrabold leading-tight mb-6">Ça se passe maintenant</h1>
            <h2 className="text-2xl font-black mb-6">Connectez-vous.</h2>

            <form className="space-y-4">
              <input
                placeholder="Email"
                className="w-full h-14 px-4 rounded border border-gray-600 bg-transparent text-gray-200 placeholder-gray-400"
              />
              <input
                placeholder="Mot de passe"
                type="password"
                className="w-full h-14 px-4 rounded border border-gray-600 bg-transparent text-gray-200 placeholder-gray-400"
              />

              <button type="submit" className="w-full h-12 bg-white text-black rounded-full font-bold">Se connecter</button>

              <div className="text-center mt-2">
                <a className="text-[#6bc9fb] text-sm">Mot de passe oublié ?</a>
              </div>

              <p className="mt-6 text-gray-400 text-sm">Vous n'avez pas de compte ? <a className="text-[#6bc9fb]">Inscrivez-vous</a></p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
