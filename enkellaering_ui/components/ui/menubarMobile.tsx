// @/components/ui/MenuBarMobile.tsx
import React, { FC, Dispatch, SetStateAction } from 'react'
import Link from 'next/link'
//import logo from '@/img/logo.svg'
import { SquareChevronRight } from 'lucide-react';

interface MenuBarMobileProps {
  setter: Dispatch<SetStateAction<boolean>>;
}

const MenuBarMobile: FC<MenuBarMobileProps> = ({ setter }) => {
  return (
    <nav className="md:hidden z-20 justify-between fixed top-0 left-0 right-0 h-[60px] bg-amber-300 dark:bg-amber-950 flex [&>*]:my-auto px-2 rounded-b-lg">
       
        < button
            className="text-4xl flex text-white"
            onClick={() => {
                setter((oldVal) => !oldVal);
            }}
        >
        <SquareChevronRight/>
      </button>

        <Link href="/" className="mr-2">
        {/*eslint-disable-next-line @next/next/no-img-element*/}
        <img
          src={'/enkel_laering_transparent.png'}
          alt="Company Logo"
          width={50}
          height={50}
        />
      </Link>

    </nav>
  )
}

export default MenuBarMobile