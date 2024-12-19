import Image from "next/image";
import { TracingBeam } from "@/components/ui/tracing-beam";
import { FocusCards } from "@/components/ui/focus-cards";

export default function Home() {
  const i=0
  return (<>       
  <TracingBeam className="px-6">  
    <FocusCardsHomePage/>
    <Image
      className="dark:invert"
      src="/vercel.svg"
      alt="Vercel logomark"
      width={20}
      height={20}
    />

    </TracingBeam>
  </>)
}

const FocusCardsHomePage = () => {

  return(<>
  </>)
}
