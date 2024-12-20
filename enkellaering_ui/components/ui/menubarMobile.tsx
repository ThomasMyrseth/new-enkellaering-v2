// @/components/ui/MenuBarMobile.tsx
import React, { FC, Dispatch, SetStateAction } from 'react'
import Link from 'next/link'
//import logo from '@/img/logo.svg'

interface MenuBarMobileProps {
  setter: Dispatch<SetStateAction<boolean>>;
}

const MenuBarMobile: FC<MenuBarMobileProps> = ({ setter }) => {
  return (
    <nav className="md:hidden z-20 fixed top-0 left-0 right-0 h-[60px] bg-black flex [&>*]:my-auto px-2">
      <button
        className="text-4xl flex text-white"
        onClick={() => {
          setter((oldVal) => !oldVal);
        }}
      >
        <h1>Icon</h1>
      </button>
      <Link href="/" className="mx-auto">
        {/*eslint-disable-next-line @next/next/no-img-element*/}
        {/* <img
          src={logo.src}
          alt="Company Logo"
          width={50}
          height={50}
        /> */}
        <h1>Image of logo</h1>
      </Link>
      <Link
        className="text-3xl flex text-white"
        href="/login"
      >
        <h1>Icon</h1>
      </Link>
    </nav>
  )
}

export default MenuBarMobile