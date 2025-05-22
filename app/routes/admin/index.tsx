import { useEffect , useState } from "react"
import { useNavigate } from "@remix-run/react";


export default function Admin(){
    const navigate=useNavigate();
    const [isAuthenticated,setIsAuthenticated]=useState(false);
    useEffect(()=>{
        const adminSession=localStorage.getItem('admin_token')
        if(adminSession){
            setIsAuthenticated(true);
        }
        else{
            navigate('/adminlogin');
            
        }

    },[])
    return(
        <div>
            {isAuthenticated?'you are welcome to the admin page':'not allowed to be here '}
        </div>
    )
}