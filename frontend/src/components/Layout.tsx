import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import AppSidebar from "./AppSidebar"

export default function Layout(){

  return(

    <div className="flex">

      <AppSidebar/>

      <div className="flex-1">

        <Navbar/>

        <div className="p-6">

          <Outlet/>

        </div>

      </div>

    </div>

  )

}