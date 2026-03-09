import { Search as SearchIcon } from "lucide-react"

const Search = ({ placeholder }) => {

  return (

    <div className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-[400px]">

      <SearchIcon size={18} className="text-gray-500" />

      <input
        type="text"
        placeholder={placeholder}
        className="ml-2 w-full outline-none text-gray-700"
      />

    </div>

  )

}

export default Search