import React, { useState } from 'react';
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import { Link } from 'react-router-dom'; 
import "tailwindcss";
import { Button } from "@material-tailwind/react";

const NavBar = () => {
  const [nav, setNav] = useState(false);

  const handleNav = () => {
    setNav(!nav);
  };

  return (
    <div className='flex justify-between items-center h-28 max-w-[1240px] mx-auto px-6 text-white'>
      <h1 className='w-full text-4xl font-bold text-[#00df9a]'>
        <Link to="/"> FinPoint</Link>
      </h1>
      <ul className='hidden md:flex text-xl'>
      </ul>
      <Link to="/Login">
        <button className="bg-[#00df9a] w-[220px] rounded-md font-medium my-3 mx-auto py-3 px-6 text-black text-lg">
          Log in
        </button>
      </Link>

      <div onClick={handleNav} className='block md:hidden'>
        {!nav ? <AiOutlineClose size={30}/> : <AiOutlineMenu size={30}/>}
      </div>
    </div>
  );
};

export default NavBar;
