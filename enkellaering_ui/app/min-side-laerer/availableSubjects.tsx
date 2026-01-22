"use client"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
import { AVAILABLE_SUBJECTS } from "@/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { AvailableSubject } from "../admin/types";

export default function AvailableSubjectsPage( {token, baseUrl} : {token :string, baseUrl :string}) {
  const [checkedSubjects, setCheckedSubjects] = useState<string[]>([])

  useEffect(() => {
    async function fetchAvailableSubjects() {
      try {
        const response = await fetch(`${baseUrl}/get-available-subjects`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          toast.error("Failed to fetch available subjects: " + response.statusText);
          return;
        }

        const data = await response.json();
        const subjects: AvailableSubject[] = data.available_subjects;
        setCheckedSubjects(subjects.map(subj => subj.subject));
      } catch (error) {
        console.error("Error fetching available subjects:", error);
        toast.error("Error fetching available subjects");
      }
    }

    fetchAvailableSubjects();
  }, [baseUrl, token]);

    return(<>
    <Card className="flex flex-col items-center w-full">
      <CardHeader>
        <CardTitle>Velg hvilke fag du føler deg trygg å undervise i</CardTitle>
        <CardDescription>Det er forventet at vet å gjøre en gammel eksamen på ~5 timer vil du klare å friske opp kunnskapene dine tilsvarende et sekser-nivå i det gjeldene faget slik at du er i stand til å undervise. Det er ikke forventet at du kan alt i dag ved å trykke på det gjeldende faget, men at du er i stand til å lære deg det dersom du får en elev i det gjeldende faget. Når du får en elev i det gjeldende faget vil du få betalt for fem timer med øvingstid der du kan friske opp dine kunskaper.</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        {Object.entries(AVAILABLE_SUBJECTS).map(([category, subjects]) => (
          <Accordion
            key={category}
            type="single"
            collapsible
            className="w-full"
          >
            <AccordionItem value={category}>
              <AccordionTrigger className="capitalize">
                {category.replace(/_/g, " ")}
              </AccordionTrigger>

              <AccordionContent>
                <div className="space-y-2">
                  {subjects.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject}
                        checked={checkedSubjects.includes(subject)}
                        onCheckedChange={(checked: boolean) => {
                          handleCheckbox(baseUrl, token, subject, checked)
                        }}
                      />
                      <label
                        htmlFor={subject}
                        className="text-sm font-medium leading-none"
                      >
                        {subject}
                      </label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </CardContent>    
    </Card>
    </>)

    async function handleCheckbox(
      baseUrl: string,
      token: string,
      subject_name: string,
      checked: boolean
    ) {
      // Optimistic UI update
      setCheckedSubjects((prev) =>
        checked
          ? [...prev, subject_name]
          : prev.filter((subject) => subject !== subject_name)
      );

      const success = await updateSubjectAvailability(
        baseUrl,
        token,
        subject_name,
        checked
      );

      // Roll back if API call failed
      if (!success) {
        setCheckedSubjects((prev) =>
          checked
            ? prev.filter((subject) => subject !== subject_name)
            : [...prev, subject_name]
        );
      }
    }

}

async function updateSubjectAvailability(
  baseUrl: string,
  token: string,
  subject_name: string,
  checked: boolean
): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/update-available-subjects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        subject: subject_name,
        availability: checked,
      }),
    });

    if (!response.ok) {
      toast.error("Kunne ikke oppdatere fagvalget ditt");
      return false;
    }

    return true;
  } catch (error) {
    toast.error(`Noe gikk galt. Prøv igjen. ${error}`);
    return false;
  }
}