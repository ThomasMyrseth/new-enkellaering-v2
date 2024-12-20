// @/components/Layout/Sidebar.tsx
import React, { Dispatch, SetStateAction, FC } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { SlHome } from 'react-icons/sl'
import { BsInfoSquare, BsEnvelopeAt } from 'react-icons/bs'
import { FaTshirt, FaRedhat } from 'react-icons/fa'
import { usePathname } from 'next/navigation'

//import logo from '@/img/logo.svg'

interface SidebarProps {
  show: boolean;
  setter: Dispatch<SetStateAction<boolean>>;
}

interface MenuItemProps {
  icon: React.ReactNode;
  name: string;
  route: string;
  setter: Dispatch<SetStateAction<boolean>>;
}

const MenuItem: FC<MenuItemProps> = ({ icon, name, route, setter }) => {
  const path = usePathname()
  const colorClass = path=== route ? "text-white" : "text-white/50 hover:text-white";

  return (
    <Link
      href={route}
      onClick={() => {
        setter((oldVal) => !oldVal);
      }}
      className={`flex gap-1 [&>*]:my-auto text-md pl-6 py-3 border-b-[1px] border-b-white/10 ${colorClass}`}
    >
      <div className="text-xl flex [&>*]:mx-auto w-[30px]">
        {icon}
      </div>
      <div>{name}</div>
    </Link>
  )
}

interface ModalOverlayProps {
  setter: Dispatch<SetStateAction<boolean>>;
}

const ModalOverlay: FC<ModalOverlayProps> = ({ setter }) => (
  <div
    className="flex md:hidden fixed top-0 right-0 bottom-0 left-0 bg-black/50 z-30"
    onClick={() => {
      setter((oldVal) => !oldVal);
    }}
  />
)

const Sidebar: FC<SidebarProps> = ({ show, setter }) => {
  const className = "bg-black w-[250px] transition-[margin-left] ease-in-out duration-500 fixed md:static top-0 bottom-0 left-0 z-40";
  const appendClass = show ? " ml-0" : " ml-[-250px] md:ml-0";

  return (
    <>
      <div className={`${className}${appendClass}`}>
        <div className="p-2 flex">
          <Link href="/">
            {/*eslint-disable-next-line @next/next/no-img-element*/}
            {/* <img
              src={logo.src}
              alt="Company Logo"
              width={300}
              height={300}
            /> */}
            <h1>Image of logo</h1>
          </Link>
        </div>
        <div className="flex flex-col">
          <MenuItem
            name="Home"
            route="/"
            icon={<SlHome />}
            setter={setter}
          />
          <MenuItem
            name="T-Shirts"
            route="/t-shirts"
            icon={<FaTshirt />}
            setter={setter}
          />
          <MenuItem
            name="Hats"
            route="/hats"
            icon={<FaRedhat />}
            setter={setter}
          />
          <MenuItem
            name="About Us"
            route="/about"
            icon={<BsInfoSquare />}
            setter={setter}
          />
          <MenuItem
            name="Contact"
            route="/contact"
            icon={<BsEnvelopeAt />}
            setter={setter}
          />
        </div>
      </div>
      {show && <ModalOverlay setter={setter} />}
    </>
  )
}

export default Sidebar