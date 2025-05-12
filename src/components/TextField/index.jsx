/* eslint-disable react/prop-types */
export default function TextField({ _title, name, value, onChangeField, onKeyDownField, placeholder }){
    return(
            <input
            className="border-2 border-gray-300 rounded-md p-4 w-80"
            type="text"
            name= {name}
            value={value}
            onChange={onChangeField}
            onKeyDown={onKeyDownField}
            placeholder= {placeholder} // IP do NAO
            />
    )
}