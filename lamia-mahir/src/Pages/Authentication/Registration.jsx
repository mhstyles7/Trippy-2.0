import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Registration = () => {
    const navigate = useNavigate();
    const handleRegister = async (e) => {
        e.preventDefault();
        console.log('Register form submitted');
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
        const role = form.status.value;
        const photoURL = form.photoURL.value;
        const name = form.name.value;
        const credentials = { email, password,photoURL,name,role };
        

        try {
            
            const res = await axios.post('http://localhost:3000/signup', credentials)
            if (res.status === 200) {
                console.log('Registration successful');
                navigate("/")
            } else {
                alert('Invalid credentials');
            }
            

            }
        catch (error) {
            console.error(error);
        } 
    }

    return (
        <div className="max-w-7xl mx-auto my-40 px-6 rounded-xl bg-gradient-to-tr from-[#000080] to-[#0DD3FA] py-3">
            <div className="p-10 my-6">           
                <form onSubmit={handleRegister}>
                    <h2 className="text-5xl mb-10 text-left font-semibold text-[#FFE72F]">Register your account</h2>
                    <h1 className="mb-4 text-lg text-white">Your Name</h1>
                    <input className="mb-4 rounded-lg px-6 py-3 w-full border border-solid border-[#0DD3FA]" type="name" name="name" id="011" placeholder="Enter name...." required/>
                    <select name="status" data-focus data-hover>
                        <option value="traveler">Traveler</option>
                        <option value="carRentalUser">Car rental user</option>
                    </select>

                    <h1 className="mb-4 text-lg text-white">Your Photo URL</h1>
                    <input className="mb-4 rounded-lg px-6 py-3 w-full border border-solid border-[#0DD3FA]" type="name" name="photoURL" id="012" placeholder="Enter photo url...."/>
                    <h1 className="mb-4 text-lg text-white">Your Email</h1>
                    <input className="mb-4 rounded-lg px-6 py-3 w-full border border-solid border-[#0DD3FA]" type="email" name="email" id="1" placeholder="Enter email..." required/>
                    <h1 className="mb-4 text-lg text-white">Your Password</h1>
                    <input className="mb-8 rounded-lg px-6 py-3 w-full border border-solid border-[#0DD3FA]" type="password" name="password" id="2" placeholder="Enter password..." required/>
                    <input className="btn btn-primary text-white text-lg mb-4 w-full bg-[#FFE72F] border-none" type="submit" name="" id="3" value="REGISTER"/>
                </form>             
                <p className="my-4 text-base font-medium text-white">Already Have an Account?<Link to="/login"><span className="text-[#FFE72F] underline text-lg font-bold"> Login Now</span></Link></p> 
                {/* The "or" portion*/}
               
                    
            </div>         
        </div>
    );
};

export default Registration;