"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HelpSession, HelpQueueEntry } from "../admin/types"
import { event } from '@/components/facebookPixel/fpixel'
import Link from "next/link"

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080"

const DAYS_NO = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"]

export default function FreeHelpPage() {
  const [activeSessions, setActiveSessions] = useState<HelpSession[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    student_name: "",
    student_email: "",
    student_phone: "",
    subject: "",
    description: ""
  })
  const [queueId, setQueueId] = useState<string | null>(null)
  const [position, setPosition] = useState<HelpQueueEntry | null>(null)
  const [zoomJoinLink, setZoomJoinLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Load queue state from localStorage on mount
  useEffect(() => {
    const savedQueueId = localStorage.getItem("help_queue_id")
    const savedZoomLink = localStorage.getItem("help_zoom_link")
    const savedFormData = localStorage.getItem("help_form_data")

    if (savedQueueId && savedQueueId !== "null" && savedQueueId !== "undefined") {
      setQueueId(savedQueueId)
    }
    if (savedZoomLink && savedZoomLink !== "null" && savedZoomLink !== "undefined") {
      setZoomJoinLink(savedZoomLink)
    }
    if (savedFormData && savedFormData !== "null" && savedFormData !== "undefined") {
      try {
        setFormData(JSON.parse(savedFormData))
      } catch (e) {
        console.error("Failed to parse saved form data", e)
      }
    }

    fetchActiveSessions()
  }, [])

  useEffect(() => {
    if (queueId) {
      fetchPosition()
      const interval = setInterval(() => {
        fetchPosition()
      }, 5000) // Poll every 5 seconds

      return () => clearInterval(interval)
    }
  }, [queueId])

  async function fetchActiveSessions() {
    try {
      const response = await fetch(`${BASEURL}/help-sessions/active`)
      if (!response.ok) {
        console.error("Failed to fetch sessions")
        return
      }
      const data = await response.json()
      setActiveSessions(data.sessions || [])
    } catch (error) {
      console.error("Failed to fetch active sessions:", error)
    }
  }

  async function fetchPosition() {
    if (!queueId) return

    try {
      const response = await fetch(`${BASEURL}/help-queue/position/${queueId}`)
      if (!response.ok) {
        console.error("Failed to fetch position")
        // If 404, the queue entry might be deleted - clear localStorage
        if (response.status === 404) {
          handleLeaveQueue()
        }
        return
      }
      const data = await response.json()
      setPosition(data.position)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch position:", error)
    }
  }

  function handleLeaveQueue() {
    // Clear state
    setQueueId(null)
    setPosition(null)
    setZoomJoinLink(null)
    setFormData({
      student_name: "",
      student_email: "",
      student_phone: "",
      subject: "",
      description: ""
    })

    // Clear localStorage
    localStorage.removeItem("help_queue_id")
    localStorage.removeItem("help_zoom_link")
    localStorage.removeItem("help_form_data")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        preferred_teacher_id: selectedSession === "snarest" ? null : selectedSession
      }

      event("join-free-help-queue")

      const response = await fetch(`${BASEURL}/help-queue/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || "Noe gikk galt")
        setLoading(false)
        return
      }

      const data = await response.json()
      setQueueId(data.queue_id)
      setZoomJoinLink(data.zoom_join_link)

      console.log("recieved zoom link:", data.zoom_join_link)

      // Save to localStorage for persistence across refreshes (only if values exist)
      if (data.queue_id) {
        localStorage.setItem("help_queue_id", data.queue_id)
      }
      if (data.zoom_join_link) {
        localStorage.setItem("help_zoom_link", data.zoom_join_link)
      }
      localStorage.setItem("help_form_data", JSON.stringify(formData))

    } catch (error) {
      console.error("Failed to join queue:", error)
      alert("Kunne ikke bli med i køen")
    } finally {
      setLoading(false)
    }
  }

  if (queueId) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-screen bg-slate-200 dark:bg-slate-900 p-4">
        <div className="w-full md:w-4/5 max-w-2xl">
          <Card className="bg-white dark:bg-black rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-neutral-800 dark:text-neutral-200">
                {position?.admitted_at ? "🎉 DET ER DIN TUR!" : "Du er i køen!"}
              </CardTitle>
              <CardDescription>
                {position?.admitted_at ? (
                  <>Du har blitt sluppet inn! Bli med i Zoom-møtet NÅ ved å klikke på lenken under.</>
                ) : zoomJoinLink ? (
                  <>Du kan bli med i Zoom-møtet nå ved å klikke på knappen under. Du vil bli sluppet inn når det er din tur. Vent i venterommet!</>
                ) : (
                  <>Du har fått en epost av oss med lenke til videomøte. Bli med i møtet nå, så slippes du inn så fort det er din tur. Husk å sjekke søppelposten!</>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                {position?.admitted_at ? (
                  <>
                    <div className="text-6xl font-bold text-green-600 dark:text-green-400 animate-pulse">
                      ✓
                    </div>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-2">
                      Du er innrømmet!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                      {position?.position || "..."}
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                      {position?.position === 1 ? "Du er neste!" : "Plass i køen"}
                    </p>
                  </>
                )}
                {lastUpdated && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                    Sist oppdatert: {lastUpdated.toLocaleTimeString('no-NO')}
                  </p>
                )}
              </div>

              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                <p className="text-neutral-800 dark:text-neutral-200"><strong>Emne:</strong> {formData.subject}</p>
                {position && (
                  <>
                    <p className="text-neutral-800 dark:text-neutral-200"><strong>Status:</strong> {position.status === 'waiting' ? 'Venter' : position.status === 'admitted' ? 'Innrømmet' : position.status}</p>
                    {position.admitted_at && (
                      <p className="text-green-600 dark:text-green-400">
                        <strong>Du er sluppet inn i møtet!</strong> Sjekk Zoom-linken.
                      </p>
                    )}
                  </>
                )}
                {zoomJoinLink && typeof zoomJoinLink === 'string' && zoomJoinLink.startsWith('http') && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1"><strong>Zoom-møte lenke:</strong></p>
                    <a
                      href={zoomJoinLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {zoomJoinLink}
                    </a>
                  </div>
                )}
              </div>

              {zoomJoinLink && (
                <a
                  href={zoomJoinLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center text-lg py-6 px-4 rounded-md font-semibold transition-colors ${
                    position?.admitted_at
                      ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {position?.admitted_at ? '🚀 BLI MED I ZOOM-MØTET NÅ!' : 'Åpne Zoom-møtet'}
                </a>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={handleLeaveQueue}
              >
                Forlat køen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-slate-200 dark:bg-slate-900 p-4">
      <div className="w-full md:w-4/5 space-y-4 mt-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
            Gratis Leksehjelp
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Få hjelp fra våre lærere - helt gratis!
          </p>
        </div>

        {activeSessions.length === 0 ? (
          <Card className="bg-white dark:bg-black rounded-lg">
            <CardContent className="text-center py-12">
              <p className="text-neutral-600 dark:text-neutral-400">
                Ingen aktive økter akkurat nå. Prøv igjen senere!
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-white dark:bg-black rounded-lg">
              <CardHeader>
                <CardTitle className="text-neutral-800 dark:text-neutral-200">Velg lærer eller snarest ledig</CardTitle>
                <CardDescription>
                  Velg en spesifikk lærer eller Snarest for å få hjelp raskest mulig. Alle tider er i Oslo-tidssone (Europe/Oslo).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  onClick={() => setSelectedSession("snarest")}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedSession === "snarest"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                      : "border-neutral-200 dark:border-neutral-700 hover:border-blue-300"
                    }`}
                >
                  <p className="font-semibold text-lg text-neutral-800 dark:text-neutral-200">Snarest ledig</p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Bli automatisk tildelt til læreren med kortest kø
                  </p>
                </div>

                {activeSessions.map((session) => (
                  <div
                    key={session.session_id}
                    onClick={() => setSelectedSession(session.teacher_user_id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedSession === session.teacher_user_id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-blue-300"
                      }`}
                  >
                    <p className="font-semibold text-lg text-neutral-800 dark:text-neutral-200">
                      {session.teacher_firstname} {session.teacher_lastname}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {session.recurring ? (
                        <>
                          {session.day_of_week !== null && DAYS_NO[session.day_of_week]} (Hver uke)
                        </>
                      ) : (
                        <>
                          {session.session_date && new Date(session.session_date).toLocaleDateString('no-NO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })} (I dag)
                        </>
                      )}
                      {" "}
                      {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-500">
                      {session.queue_count || 0} i kø
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {selectedSession && (
              <Card className="bg-white dark:bg-black rounded-lg">
                <form onSubmit={handleSubmit}>
                  <CardHeader>
                    <CardTitle className="text-neutral-800 dark:text-neutral-200">Fyll inn dine detaljer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="student_name">Navn *</Label>
                      <Input
                        id="student_name"
                        required
                        value={formData.student_name}
                        onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="student_email">E-post</Label>
                      <Input
                        id="student_email"
                        type="email"
                        value={formData.student_email}
                        onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="student_phone">Telefon</Label>
                      <Input
                        id="student_phone"
                        value={formData.student_phone}
                        onChange={(e) => setFormData({ ...formData, student_phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Emne *</Label>
                      <Input
                        id="subject"
                        required
                        placeholder="F.eks. Matematikk, Norsk, Engelsk..."
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Beskrivelse</Label>
                      <Textarea
                        id="description"
                        placeholder="Hva trenger du hjelp med?"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Vennligst vent..." : "Bli med i køen"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}
