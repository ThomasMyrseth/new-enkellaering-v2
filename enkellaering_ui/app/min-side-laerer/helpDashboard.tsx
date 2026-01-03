"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { TeacherHelpConfig, HelpSession, HelpQueueEntry } from "../admin/types"
import { toast } from "sonner"

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080"
const DAYS_NO = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"]

interface Payload {
  recurring: boolean
  day_of_week?: number
  session_date?: string
  start_time: string
  end_time: string
  zoom_link: string
}

export function TeacherHelpDashboard({ token }: { token: string }) {
  const [config, setConfig] = useState<TeacherHelpConfig | null>(null)
  const [sessions, setSessions] = useState<HelpSession[]>([])
  const [queue, setQueue] = useState<HelpQueueEntry[]>([])
  const [availableForHelp, setAvailableForHelp] = useState<boolean>(false)

  // New session form
  const [recurring, setRecurring] = useState<boolean>(false)
  const [newSession, setNewSession] = useState({
    day_of_week: 0,
    session_date: "",
    start_time: "16:00",
    end_time: "20:00",
    zoom_link: ""
  })

  useEffect(() => {
    fetchConfig()
    fetchSessions()
    fetchQueue()

    // Poll queue every 10 seconds
    const interval = setInterval(fetchQueue, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (config) {
      setAvailableForHelp(config.available_for_help)
    }
  }, [config])

  async function fetchConfig() {
    try {
      const response = await fetch(`${BASEURL}/teacher/help-config`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        console.error("Failed to fetch config")
        return
      }
      const data = await response.json()
      setConfig(data.config)
      setAvailableForHelp(data.config.available_for_help)
    } catch (error) {
      console.error("Failed to fetch config:", error)
    }
  }

  async function fetchSessions() {
    try {
      const response = await fetch(`${BASEURL}/teacher/my-sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        console.error("Failed to fetch sessions")
        return
      }
      const data = await response.json()
      setSessions(data.sessions || []) //list of dicts
      console.log("Fetched sessions:", data.sessions)
    } catch (error) {
      console.error("Failed to fetch sessions:", error)
    }
  }

  async function fetchQueue() {
    try {
      const response = await fetch(`${BASEURL}/teacher/queue`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        console.error("Failed to fetch queue")
        return
      }
      const data = await response.json()
      const queues = data.queues || [] //list of dicts

      console.log("Fetched queues:", queues)

      if (queues.length > 1) {
        console.warn("Multiple queues found for teacher, using the first one.")
        toast.warning('Du har flere aktive økter nå. Vennligst slett alle untatt én for å unngå forvirring.')
      }

      if (queues.length === 0) {
        setQueue([])
        return
      }

      const firstQueue = queues[0].queue
      setQueue(firstQueue || [])

    } catch (error) {
      console.error("Failed to fetch queue:", error)
    }
  }

  async function createSession() {
    // Validate based on session type
    if (recurring && newSession.day_of_week === undefined) {
      toast.error("Velg en dag for tilbakevendende økt")
      return
    }
    if (!recurring && !newSession.session_date) {
      toast.error("Velg en dato for engangsøkt")
      return
    }

    //make sure we have a zoom link!
    if (!newSession.zoom_link || !newSession.zoom_link.trim()) {
      toast.error("Vennligst oppgi en Zoom-lenke")
      return
    }

    //make sure it has https
    if (!newSession.zoom_link.startsWith("https://")) {
      toast.error("Zoom-lenken må starte med https://")
      return
    }

    try {
      const payload: Payload = {
        recurring: recurring,
        start_time: newSession.start_time,
        end_time: newSession.end_time,
        zoom_link: newSession.zoom_link
      }

      if (recurring) {
        payload.day_of_week = newSession.day_of_week
      } else {
        payload.session_date = newSession.session_date
      }

      const response = await fetch(`${BASEURL}/teacher/my-sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(`Kunne ikke opprette økten: ${error.error || 'Ukjent feil'}`)
        return
      }

      toast.success("Økten er opprettet!")
      setNewSession({
        day_of_week: 0,
        session_date: "",
        start_time: "16:00",
        end_time: "20:00",
        zoom_link: ""
      })
      fetchSessions()
    } catch (error) {
      console.error("Failed to create session:", error)
      toast.error("Kunne ikke opprette økten")
    }
  }

  async function deleteSession(sessionId: string) {
    if (!confirm("Er du sikker på at du vil slette denne økten?")) return

    try {
      const response = await fetch(`${BASEURL}/teacher/my-sessions/${sessionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        toast.error("Kunne ikke slette økten")
        return
      }

      toast.success("Økten er slettet")
      fetchSessions()
    } catch (error) {
      console.error("Failed to delete session:", error)
      toast.error("Kunne ikke slette økten")
    }
  }

  async function handleQueueAction(queueId: string, action: 'admit' | 'complete' | 'no-show') {
    try {
      const response = await fetch(`${BASEURL}/teacher/queue/${queueId}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        toast.error(`Kunne ikke ${action} student`)
        return
      }

      fetchQueue()
    } catch (error) {
      console.error(`Failed to ${action} student:`, error)
    }
  }

  //dont display is teacher is not set to available for help
  if (!availableForHelp) {
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mine økter</CardTitle>
          <CardDescription>Opprett og administrer dine hjelpeøkter. <br/>Alle tider er i Oslo-tid, kun relevant om du er i utlandet.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="recurring-teacher"
              checked={recurring}
              onCheckedChange={setRecurring}
            />
            <Label htmlFor="recurring-teacher">Tilbakevendende økt (gjentas hver uke)</Label>
          </div>

          {recurring ? (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="day">Dag</Label>
                <select
                  id="day"
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
                <Label htmlFor="start">Start</Label>
                <Input
                  id="start"
                  type="time"
                  value={newSession.start_time}
                  onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end">Slutt</Label>
                <Input
                  id="end"
                  type="time"
                  value={newSession.end_time}
                  onChange={(e) => setNewSession({ ...newSession, end_time: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date">Dato</Label>
                <Input
                  id="date"
                  type="date"
                  value={newSession.session_date}
                  onChange={(e) => setNewSession({ ...newSession, session_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="start">Start</Label>
                <Input
                  id="start"
                  type="time"
                  value={newSession.start_time}
                  onChange={(e) => setNewSession({ ...newSession, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end">Slutt</Label>
                <Input
                  id="end"
                  type="time"
                  value={newSession.end_time}
                  onChange={(e) => setNewSession({ ...newSession, end_time: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="zoom_link_session">Zoom-lenke for denne økten *</Label>
            <Input
              id="zoom_link_session"
              type="url"
              placeholder="https://zoom.us/j/..."
              value={newSession.zoom_link}
              onChange={(e) => setNewSession({ ...newSession, zoom_link: e.target.value })}
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              Denne lenken vil brukes for denne spesifikke økten
            </p>
          </div>

          <Button className="h-8 w-36" onClick={createSession} variant="secondary">Opprett økt</Button>

          <div className="space-y-2 mt-4">
            <h3 className="font-semibold">Planlagde og pågående økter:</h3>
            <p>Dette er alle økter som allerede har startet, samt økter som er planlagt i fremtiden.</p>
            {sessions.length === 0 ? (
              <p className="text-gray-500">Ingen økter opprettet ennå</p>
            ) : (
              sessions.map((session) => {
                
                const end = new Date(session.end_time).getTime()
                const now = Date.now()
                //do not display completed, non-recurring sessions
                if (end < now && !session.recurring) {
                  return null
                }

                return(
                <div key={session.session_id} className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <p>
                      {session.recurring ? (
                        <>
                          <strong>
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
                            })()}
                          </strong>{" "}
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

                          const datePart = dateFormatter
                            .format(startDate)
                            .replace(/\./g, "")

                          const startTime = timeFormatter.format(startDate)
                          const endTime = timeFormatter.format(endDate)

                          return (
                            <strong>
                              {datePart} {startTime}-{endTime}
                            </strong>
                          )
                        })()}
                        {" "} (Engangsøkt)
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
              )})
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kø ({queue.length})</CardTitle>
          <CardDescription>Studenter som venter på hjelp</CardDescription>
        </CardHeader>
        <CardContent>
          {queue.length === 0 ? (
            <p className="text-gray-500">Ingen i køen</p>
          ) : (
            <div className="space-y-3">
              {queue.map((entry) => (
                <div key={entry.queue_id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{entry.student_name}</p>
                      {entry.student_email && (
                        <p className="text-sm text-gray-600">{entry.student_email}</p>
                      )}
                      {entry.student_phone && (
                        <p className="text-sm text-gray-600">{entry.student_phone}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Emne:</strong> {entry.subject}
                      </p>
                      {entry.description && (
                        <p className="text-sm text-gray-500 mt-1">{entry.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Posisjon: {entry.position}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleQueueAction(entry.queue_id, 'complete')}
                      >
                        Fullført
                      </Button>
        
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleQueueAction(entry.queue_id, 'no-show')}
                      >
                        Møtte ikke
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
