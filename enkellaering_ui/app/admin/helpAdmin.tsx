"use client"

import { useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpSession, TeacherWithHelpConfig } from "./types"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import { useTeacherAvailability } from "@/hooks/use-teacher-availability"
import { useAdminHelpSessions } from "@/hooks/use-admin-help-sessions"
import { Skeleton } from "@/components/ui/skeleton"

const DAYS_NO = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"]

export function HelpAdminPanel({ token }: { token: string }) {
  const [teachersRefreshKey, setTeachersRefreshKey] = useState<number>(0)
  const [sessionsRefreshKey, setSessionsRefreshKey] = useState<number>(0)

  const [teachersData, teachersLoading, teachersError] = useTeacherAvailability(teachersRefreshKey)
  const [sessionsData, sessionsLoading, sessionsError] = useAdminHelpSessions(sessionsRefreshKey)

  if (teachersError) toast.error("Kunne ikke hente lærere: " + teachersError)
  if (sessionsError) toast.error("Kunne ikke hente økter: " + sessionsError)

  const teachers = useMemo(() => {
    //order alphabetically by firstname
    return [...teachersData].sort((a: TeacherWithHelpConfig, b: TeacherWithHelpConfig) =>
      a.firstname.localeCompare(b.firstname)
    )
  }, [teachersData])

  const sessions = useMemo(() => {
    //order by day_of_week and start_time
    return [...sessionsData].sort((a: HelpSession, b: HelpSession) => {
      if (a.recurring && b.recurring) {
        if (a.day_of_week === b.day_of_week) {
          return a.start_time.localeCompare(b.start_time)
        }
        return (a.day_of_week || 0) - (b.day_of_week || 0)
      } else if (a.recurring) {
        return -1
      } else if (b.recurring) {
        return 1
      } else {
        return a.start_time.localeCompare(b.start_time)
      }
    })
  }, [sessionsData])

  async function toggleAvailability(teacherId: string, currentStatus: boolean) {
    try {
      await apiFetch(`/admin/teacher/${teacherId}/toggle-availability`, {
        method: "POST",
        body: { available_for_help: !currentStatus }
      })

      toast.success("Tilgjengelighet oppdatert")
      setTeachersRefreshKey((k) => k + 1)
    } catch (error) {
      console.error("Failed to toggle availability:", error)
      toast.error("Kunne ikke oppdatere tilgjengelighet")
    }
  }

  async function deleteSession(sessionId: string) {
    if (!confirm("Er du sikker på at du vil slette denne økten?")) return

    try {
      await apiFetch(`/admin/help-sessions/${sessionId}`, {
        method: "DELETE"
      })

      toast.success("Økten er slettet")
      setSessionsRefreshKey((k) => k + 1)
    } catch (error) {
      console.error("Failed to delete session:", error)
      toast.error("Kunne ikke slette økten")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Administrer Gratis Leksehjelp</CardTitle>
        <CardDescription>
          Administrer lærere og økter for gratis leksehjelp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Lærertilgjengelighet</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {teachersLoading ? (
              <>
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : teachers.map((teacher) => (
              <div key={teacher.user_id} className="flex items-center justify-between p-2 border rounded">
                <span>{teacher.firstname} {teacher.lastname}</span>
                <Button
                  size="sm"
                  variant={teacher.teacher_help_config?.available_for_help ? "destructive" : "secondary"}
                  onClick={() => toggleAvailability(teacher.user_id, teacher.teacher_help_config?.available_for_help || false)}
                >
                  {teacher.teacher_help_config?.available_for_help ? "Tilgjengelig" : "Ikke tilgjengelig"}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Alle økter ({sessions.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sessionsLoading ? (
              <>
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : sessions.length === 0 ? (
              <p className="text-gray-500">Ingen økter opprettet ennå</p>
            ) : (
              sessions.map((session) => (
                <div key={session.session_id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">
                      {session.teachers?.firstname} {session.teachers?.lastname}
                    </p>
                    <p className="text-sm text-gray-600">
                      {session.recurring ? (
                        <>
                          {session.day_of_week !== null && DAYS_NO[session.day_of_week]}{" "}
                          {(() => {
                            const timeFormatter = new Intl.DateTimeFormat("nb-NO", {
                              timeZone: "Europe/Oslo",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            const start = timeFormatter.format(new Date(session.start_time))
                            const end = timeFormatter.format(new Date(session.end_time))
                            return `${start}-${end}`
                          })()}{" "}
                          (Tilbakevendende)
                        </>
                      ) : (
                        <>
                          {(() => {
                            const dateFormatter = new Intl.DateTimeFormat("nb-NO", {
                              timeZone: "Europe/Oslo",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                            const timeFormatter = new Intl.DateTimeFormat("nb-NO", {
                              timeZone: "Europe/Oslo",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            const startDate = new Date(session.start_time)
                            const endDate = new Date(session.end_time)
                            const datePart = dateFormatter.format(startDate).replace(/\./g, "")
                            const startTime = timeFormatter.format(startDate)
                            const endTime = timeFormatter.format(endDate)
                            return `${datePart} ${startTime}-${endTime}`
                          })()}{" "}
                          (Engangsøkt)
                        </>
                      )}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteSession(session.session_id)}
                  >
                    Slett
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
