/* eslint-disable react/prop-types */
export default function ButtonSystem({ className, fetchQuestion, children }) {
    return (
        <button className={`${className} flex items-center justify-center font-bold text-2xl gap-3 text-white p-3 rounded-md`} type="button" onClick={fetchQuestion}>
            {children}
        </button>
    )
}