/* eslint-disable react/prop-types */
export default function Response({ loading, response, error }){
    return(
        <section className="rounded-md bg-gray-200 text-black p-2 max-w-prose">
            {loading && <p>Carregando...</p>}
            {response && (
                <div className="">
                    <h1 className="font-bold">Resposta do JANO: </h1>
                    <p>{response}</p>
                </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </section>
    )
}