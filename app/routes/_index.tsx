import { useNavigate } from "@remix-run/react"
import { useEffect } from "react";

export default function Index(){
  const navigate=useNavigate();
  
  useEffect(()=>{
    navigate('/login');
  },[])

  return(

    <>
    This is the index page go to /dashboard
    </>
  )
}