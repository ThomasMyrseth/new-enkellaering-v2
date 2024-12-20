// @/components/Layout/Sidebar.tsx
import React, { Dispatch, SetStateAction, FC } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { LayoutDashboard, ShoppingCart } from 'lucide-react'
import { LockKeyhole } from 'lucide-react'
import { LockKeyholeOpen } from 'lucide-react'
import { BookUser } from 'lucide-react'

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
  const colorClass = path === route ? "text-black dark:text-white" : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white";

  return (
    <Link
      href={route}
      onClick={() => {
        setter((oldVal) => !oldVal);
      }}
      className={`text-black dark:text-gray-100 flex gap-1 [&>*]:my-auto text-md pl-6 py-3 border-b-[1px] border-b-white/10 ${colorClass}`}
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
  const className = "h-full min-h-screen bg-slate-200 dark:bg-black text-black dark:text-white w-[250px] transition-[margin-left] ease-in-out duration-500 fixed md:static top-0 bottom-0 left-0 z-40";
  const appendClass = show ? " ml-0" : " ml-[-250px] md:ml-0";

  return (
    <div className=''>
      <div className={`${className}${appendClass}`}>
        <div className="p-2 flex items-center justify-center">
          <Link href="/">
            {/*eslint-disable-next-line @next/next/no-img-element*/}
            <img
              src={'/enkel_laering_transparent.png'}
              alt="Company Logo"
              width={70}
              height={70}
            />
          </Link>
        </div>
        <div className="flex flex-col">
          <MenuItem
            name="Bestill"
            route="/bestill"
            icon={<ShoppingCart/>}
            setter={setter}
          />
          <MenuItem
            name="Om oss"
            route="/om-oss"
            icon={<BookUser/>}
            setter={setter}
          />
          <MenuItem
            name="Login for elev"
            route="login"
            icon={<LockKeyholeOpen/>}
            setter={setter}
          />
          <MenuItem
            name="Min side for elev"
            route="/min-side"
            icon={<LayoutDashboard/>}
            setter={setter}
          />
          <MenuItem
            name="Login for lærer"
            route="/login-laerer"
            icon={<LockKeyholeOpen/>}
            setter={setter}
          />
        <MenuItem
            name="Min side for lærer"
            route="/min-side-laerer"
            icon={<LayoutDashboard />}
            setter={setter}
          />
                  <MenuItem
            name="Logg ut"
            route="/logout"
            icon={<LockKeyhole />}
            setter={setter}
          />
        </div>
      </div>
      {show && <ModalOverlay setter={setter} />}
    </div>
  )
}

export default Sidebar