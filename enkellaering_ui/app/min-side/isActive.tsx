import { Student } from "../admin/types";

export const IsActive = ( {student} : {student :Student} ) => {
    if (student.is_active) {
        return null;
    }

    return (<div className="w-full md:w-3/4 rounded-sm bg-red-300 m-4 p-4 text-center">
        <h1 className="text-red-600 text-5xl">Dere er satt til inaktiv</h1>
        <p>Dette er grunnet at dere ikke har hatt timer på en god stund. 
            Læreren deres får dere ikke lenger opp på sin min-side.
        </p>
        <br/>
        <h3>Dersom dette er feil eller dere ønsker å starte opp med privatundervisning igjen kan dere kontakte <br/>
            <span className="font-bold">Thomas Myrseth, tlf: 47184744 <br/>
            Karoline Aasheim, tlf: 90656969 <br/>
            Epost: kontakt@enkellaering.no
            </span>
        </h3>
    </div>)
}