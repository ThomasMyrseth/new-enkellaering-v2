"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { HelpSession, TeacherWithHelpConfig } from "./types"
import { toast } from "sonner"

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080"
const DAYS_NO = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"]

interface Payload {
  teacher_user_id: string
  recurring: boolean
  day_of_week?: number
  session_date?: string
  start_time: string
  end_time: string
}

export function HelpAdminPanel({ token }: { token: string }) {
  const [teachers, setTeachers] = useState<TeacherWithHelpConfig[]>([])
  const [sessions, setSessions] = useState<HelpSession[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<string>("")
  const [recurring, setRecurring] = useState<boolean>(false)
  const [newSession, setNewSession] = useState({
    day_of_week: 0,
    session_date: "",
    start_time: "16:00",
    end_time: "20:00"
  })

  useEffect(() => {
    fetchTeachers()
    fetchAllSessions()
  }, [])

  async function fetchTeachers() {
    try {
      const response = await fetch(`${BASEURL}/admin/teachers/availability`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        console.error("Failed to fetch teachers")
        return
      }
      const data = await response.json()
      const t = data.teachers_availability
      //order alphabetically by firstname
      t.sort((a: TeacherWithHelpConfig, b: TeacherWithHelpConfig) => a.firstname.localeCompare(b.firstname))

      setTeachers(t || [])
    } catch (error) {
      console.error("Failed to fetch teachers:", error)
    }
  }

  async function fetchAllSessions() {
    try {
      const response = await fetch(`${BASEURL}/admin/help-sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        console.error("Failed to fetch sessions")
        return
      }
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
    }
  }

  async function toggleAvailability(teacherId: string, currentStatus: boolean) {
    try {
      const response = await fetch(`${BASEURL}/admin/teacher/${teacherId}/toggle-availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ available_for_help: !currentStatus })
      })

      if (!response.ok) {
        toast.error("Kunne ikke oppdatere tilgjengelighet")
        return
      }

      toast.success("Tilgjengelighet oppdatert")
      fetchTeachers()
    } catch (error) {
      console.error("Failed to toggle availability:", error)
      toast.error("Kunne ikke oppdatere tilgjengelighet")
    }
  }

  async function createSession() {
    if (!selectedTeacher) {
      alert("Velg en lærer")
      return
    }

    // Validate based on session type
    if (recurring && newSession.day_of_week === undefined) {
      alert("Velg en dag for tilbakevendende økt")
      return
    }
    if (!recurring && !newSession.session_date) {
      alert("Velg en dato for engangsokt")
      return
    }

    try {
      const payload : Payload = {
        teacher_user_id: selectedTeacher,
        recurring: recurring,
        start_time: newSession.start_time,
        end_time: newSession.end_time
      }

      if (recurring) {
        payload.day_of_week = newSession.day_of_week
      } else {
        payload.session_date = newSession.session_date
      }

      const response = await fetch(`${BASEURL}/admin/help-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Kunne ikke opprette økten: ${error.error || 'Ukjent feil'}`)
        return
      }

      alert("Økten er opprettet!")
      fetchAllSessions()
    } catch (error) {
      console.error("Failed to create session:", error)
      alert("Kunne ikke opprette økten")
    }
  }

  async function deleteSession(sessionId: string) {
    if (!confirm("Er du sikker på at du vil slette denne økten?")) return

    try {
      const response = await fetch(`${BASEURL}/admin/help-sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        alert("Kunne ikke slette økten")
        return
      }

      alert("Økten er slettet")
      fetchAllSessions()
    } catch (error) {
      console.error("Failed to delete session:", error)
      alert("Kunne ikke slette økten")
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
            {teachers.map((teacher) => (
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
          <h3 className="font-semibold mb-3">Opprett økt for lærer</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="teacher-select">Velg lærer</Label>
              <select
                id="teacher-select"
                className="w-full border rounded-md p-2"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="">-- Velg lærer --</option>
                {teachers.map((teacher) => (
                  <option key={teacher.user_id} value={teacher.user_id}>
                    {teacher.firstname} {teacher.lastname}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="recurring-switch"
                checked={recurring}
                onCheckedChange={setRecurring}
              />
              <Label htmlFor="recurring-switch">Tilbakevendende økt (gjentas hver uke)</Label>
            </div>

            {recurring ? (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="admin-day">Dag</Label>
                  <select
                    id="admin-day"
                    className="w-full border rounded-md p-2"
                    value={newSession.day_of_week}
                    onChange={(e) => setNewSession({ ...newSession, day_of_week: parseInt(e.target.value) })}
                  >
                    {DAYS_NO.map((day, idx) => (
                      <option key={idx} value={idx}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="admin-start">Start</Label>
                  <Input
                    id="admin-start"
                    type="time"
                    value={newSession.start_time}
                    onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="admin-end">Slutt</Label>
                  <Input
                    id="admin-end"
                    type="time"
                    value={newSession.end_time}
                    onChange={(e) => setNewSession({ ...newSession, end_time: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="admin-date">Dato</Label>
                  <Input
                    id="admin-date"
                    type="date"
                    value={newSession.session_date}
                    onChange={(e) => setNewSession({ ...newSession, session_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="admin-start">Start</Label>
                  <Input
                    id="admin-start"
                    type="time"
                    value={newSession.start_time}
                    onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="admin-end">Slutt</Label>
                  <Input
                    id="admin-end"
                    type="time"
                    value={newSession.end_time}
                    onChange={(e) => setNewSession({ ...newSession, end_time: e.target.value })}
                  />
                </div>
              </div>
            )}
            <Button onClick={createSession}>Opprett økt</Button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Alle økter ({sessions.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sessions.length === 0 ? (
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
