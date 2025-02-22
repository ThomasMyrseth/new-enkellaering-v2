export type CardType = {
    user_id :string //uuidV4
    firstname: string; //Thomas
    lastname: string; //Myrseth
    location: string; //OSLO, TRONDHEIM, BERGEN, etc
    qualifications: string[] //R1, Ungdomskole, Spansk
    description: string; //Jeg heter Thomas og er ...
    src: string; //bilde av meg
    digitalTutouring: boolean; //true=Ja til digitalt, false=Nei til digitalt
    physicalTutouring: boolean //true=Ja til fysisk, false= Nei til fysisk
    available: boolean //true=Wants more students, false = Doesnt want more students
}




export const cities :string[] = ['Oslo', 'Trondheim', 'Annet']
export const qualifications :string[] = ['1P', '1T', '2P', 'S1', 'S2', 'R1', 'R2', 'Matte ungdomskole', 'Annet']



export const cards: CardType[] = [
    {
        user_id: '1',
      firstname: "Thomas",
      lastname: "Myrseth",
      location: "Oslo",
      qualifications: ["R1", "Ungdomsskole", "Spansk"],
      description: 
        "Jeg heter Thomas og er en erfaren privatlærer med en dyp lidenskap for undervisning. Med mange års erfaring innen matematikk, ungdomsskolefag og språk, hjelper jeg studenter med å forstå komplekse konsepter på en enkel og engasjerende måte. \n\n" +
        "Jeg har jobbet med elever på ulike nivåer, og jeg tilpasser undervisningen for å sikre at hver enkelt får den hjelpen de trenger for å lykkes. Enten det er forberedelser til eksamen, leksehjelp eller dybdelæring i spesifikke fag, er jeg her for å veilede og motivere elevene mine til å oppnå sitt fulle potensial.",
      src: "https://assets.aceternity.com/demos/thomas.jpeg",
      digitalTutouring: true,
      physicalTutouring: true,
      available: true,
    },
    {
        user_id: '2',
      firstname: "Lana",
      lastname: "Del Rey",
      location: "Los Angeles",
      qualifications: ["Musikk", "Lyrikk", "Sangskriving"],
      description: 
        "Jeg heter Lana Del Rey, en amerikansk sanger og låtskriver kjent for min unike musikalske stil som kombinerer melankoli, vintage glamour og poetisk historiefortelling. Med en stemme som fanger lytteren, har jeg skapt en rekke ikoniske låter som reflekterer både mørke og drømmende følelser. \n\n" +
        "Min musikk er sterkt påvirket av både klassiske Hollywood-ikoner og moderne popkultur, og gjennom årene har jeg bygget opp en dedikert fanskare verden over. Jeg elsker å formidle dype følelser gjennom lyrikk og melodi, og jeg finner inspirasjon i alt fra 50-tallets filmstjerner til den moderne livsstilen i Los Angeles.",
      src: "https://assets.aceternity.com/demos/lana-del-rey.jpeg",
      digitalTutouring: false,
      physicalTutouring: false,
      available: false,
    },
    {
        user_id: '3',
      firstname: "Babbu",
      lastname: "Maan",
      location: "Punjab",
      qualifications: ["Musikk", "Sangskriving", "Poet"],
      description: 
        "Jeg heter Babbu Maan, en legendarisk Punjabi-sanger, låtskriver og skuespiller med en dyp lidenskap for å bevare og formidle den rike kulturen og arven fra Punjab. Gjennom min musikk forteller jeg historier om kjærlighet, livets utfordringer og samfunnets realiteter. \n\n" +
        "Med en karriere som strekker seg over flere tiår, har jeg oppnådd en enorm popularitet både i India og blant Punjabi-samfunn over hele verden. Min musikk er kjent for sin ærlighet og evne til å berøre folks hjerter. Jeg bruker mine tekster til å gi stemme til de som ofte ikke blir hørt, og jeg brenner for å bringe Punjabi-kulturen til nye generasjoner. \n\n" +
        "Jeg heter James Hetfield, grunnlegger, vokalist og rytmegitarist i Metallica, et av verdens mest innflytelsesrike heavy metal-band. Gjennom min musikk har jeg vært med på å definere og utvikle sjangeren, og Metallica har i over fire tiår vært en av de ledende aktørene innen rock og metal. \n\n" +
        "Mine tekster og musikk utforsker temaer som kamp, indre demoner og samfunnets utfordringer, og jeg er kjent for min kraftige vokal og aggressive gitarspill. Metallica har solgt millioner av album og turnert verden over, og vår musikk fortsetter å inspirere nye generasjoner av rocke- og metalfans.",
      src: "https://assets.aceternity.com/demos/babbu-maan.jpeg",
      digitalTutouring: true,
      physicalTutouring: true,
      available: true,
    },
    {
        user_id: '4',
      firstname: "James",
      lastname: "Hetfield",
      location: "Trondheim",
      qualifications: ["Gitar", "Sang", "Låtskriving", "1P"],
      description: 
        "Jeg heter James Hetfield, grunnlegger, vokalist og rytmegitarist i Metallica, et av verdens mest innflytelsesrike heavy metal-band. Gjennom min musikk har jeg vært med på å definere og utvikle sjangeren, og Metallica har i over fire tiår vært en av de ledende aktørene innen rock og metal. \n\n" +
        "Mine tekster og musikk utforsker temaer som kamp, indre demoner og samfunnets utfordringer, og jeg er kjent for min kraftige vokal og aggressive gitarspill. Metallica har solgt millioner av album og turnert verden over, og vår musikk fortsetter å inspirere nye generasjoner av rocke- og metalfans.",
      src: "https://assets.aceternity.com/demos/metallica.jpeg",
      digitalTutouring: false,
      physicalTutouring: true,
      available: false,
    },
    {
        user_id: '5',
      firstname: "Himesh",
      lastname: "Reshammiya",
      location: "Oslo",
      qualifications: ["Musikkproduksjon", "1P", "Komponist", "Sanger", "bananavasking", "engelsk", "norsk"],
      description: 
        "Jeg heter Himesh Reshammiya, en av Indias mest anerkjente musikkomponister, sangere og skuespillere. Med en unik stil og en særegen stemme har jeg satt mitt preg på Bollywood-musikken, og mange av mine sanger har blitt store hits som folk fortsatt synger med på i dag. \n\n" +
        "Min musikk kombinerer moderne og tradisjonelle elementer, og jeg har eksperimentert med ulike sjangere for å skape en frisk og innovativ lyd. Gjennom årene har jeg oppnådd suksess både som soloartist og som komponist for store Bollywood-filmer, og min evne til å skape fengende melodier har gitt meg en lojal fanskare både i India og internasjonalt.",
      src: "https://assets.aceternity.com/demos/aap-ka-suroor.jpeg",
      digitalTutouring: false,
      physicalTutouring: false,
      available: true,
    },
];