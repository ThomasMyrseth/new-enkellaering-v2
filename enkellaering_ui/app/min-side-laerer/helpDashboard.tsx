"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { TeacherHelpConfig, HelpSession, HelpQueueEntry } from "../admin/types"

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080"
const DAYS_NO = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"]

interface Payload {
  recurring: boolean
  day_of_week?: number
  session_date?: string
  start_time: string
  end_time: string
}

export function TeacherHelpDashboard({ token }: { token: string }) {
  const [config, setConfig] = useState<TeacherHelpConfig | null>(null)
  const [sessions, setSessions] = useState<HelpSession[]>([])
  const [queue, setQueue] = useState<HelpQueueEntry[]>([])
  const [zoomHostLink, setZoomHostLink] = useState<string>("")
  const [zoomJoinLink, setZoomJoinLink] = useState<string>("")
  const [availableForHelp, setAvailableForHelp] = useState<boolean>(false)

  // New session form
  const [recurring, setRecurring] = useState<boolean>(false)
  const [newSession, setNewSession] = useState({
    day_of_week: 0,
    session_date: "",
    start_time: "16:00",
    end_time: "20:00"
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
      setZoomHostLink(config.zoom_host_link || "")
      setZoomJoinLink(config.zoom_join_link || "")
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
      setSessions(data.sessions || [])
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
      setQueue(data.queue || [])
    } catch (error) {
      console.error("Failed to fetch queue:", error)
    }
  }

  async function updateConfig() {
    try {
      const response = await fetch(`${BASEURL}/teacher/help-config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          zoom_host_link: zoomHostLink,
          zoom_join_link: zoomJoinLink,
          available_for_help: availableForHelp
        })
      })

      if (!response.ok) {
        alert("Kunne ikke oppdatere konfigurasjonen")
        return
      }

      alert("Konfigurasjonen er oppdatert!")
      fetchConfig()
    } catch (error) {
      console.error("Failed to update config:", error)
      alert("Kunne ikke oppdatere konfigurasjonen")
    }
  }

  async function createSession() {
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
      const payload: Payload = {
        recurring: recurring,
        start_time: newSession.start_time,
        end_time: newSession.end_time
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
        alert(`Kunne ikke opprette økten: ${error.error || 'Ukjent feil'}`)
        return
      }

      alert("Økten er opprettet!")
      fetchSessions()
    } catch (error) {
      console.error("Failed to create session:", error)
      alert("Kunne ikke opprette økten")
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
        alert("Kunne ikke slette økten")
        return
      }

      alert("Økten er slettet")
      fetchSessions()
    } catch (error) {
      console.error("Failed to delete session:", error)
      alert("Kunne ikke slette økten")
    }
  }

  async function handleQueueAction(queueId: string, action: 'admit' | 'complete' | 'no-show') {
    try {
      const response = await fetch(`${BASEURL}/teacher/queue/${queueId}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        alert(`Kunne ikke ${action} student`)
        return
      }

      fetchQueue()
    } catch (error) {
      console.error(`Failed to ${action} student:`, error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gratis Leksehjelp - Konfigurasjon</CardTitle>
          <CardDescription>
            Sett opp dine Zoom-linker og tilgjengelighet for gratis leksehjelp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="zoom_host_link">Zoom lenke til møte</Label>
            <Input
              id="zoom_host_link"
              placeholder="https://zoom.us/j/..."
              value={zoomHostLink}
              onChange={(e) => setZoomHostLink(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="available">Jeg er tilgjengelig for gratis hjelp</Label>
            <Switch
              id="available"
              checked={availableForHelp}
              onCheckedChange={setAvailableForHelp}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" onClick={updateConfig}>Lagre konfigurasjon</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mine økter</CardTitle>
          <CardDescription>Opprett og administrer dine hjelpeøkter</CardDescription>
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
          <Button onClick={createSession}>Opprett økt</Button>

          <div className="space-y-2 mt-4">
            <h3 className="font-semibold">Eksisterende økter:</h3>
            {sessions.length === 0 ? (
              <p className="text-gray-500">Ingen økter opprettet ennå</p>
            ) : (
              sessions.map((session) => (
                <div key={session.session_id} className="p-3 border rounded-lg flex justify-between items-center">
                  <div>
                    <p>
                      {session.recurring ? (
                        <>
                          <strong>{session.day_of_week !== null && DAYS_NO[session.day_of_week]}</strong> (Tilbakevendende)
                        </>
                      ) : (
                        <>
                          <strong>{session.session_date}</strong> (Engangsøkt)
                        </>
                      )}
                      {" "}
                      {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
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
                        variant="default"
                        onClick={() => handleQueueAction(entry.queue_id, 'admit')}
                      >
                        Innrøm
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleQueueAction(entry.queue_id, 'complete')}
                      >
                        Fullfør
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

      {zoomHostLink && (
        <Button className="w-full" asChild>
          <a href={zoomHostLink} target="_blank" rel="noopener noreferrer">
            Åpne Zoom (Host Link)
          </a>
        </Button>
      )}
    </div>
  )
}
