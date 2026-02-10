"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HelpSession, HelpQueueEntry } from "../admin/types"
import { event } from '@/components/facebookPixel/fpixel'
import Link from "next/link"
import { toast } from "sonner"
import DitherShader from "@/components/ui/dither-shader"
import WaitlistForm from "@/components/waitlistForm"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080"

const DAYS_NO = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"]

export default function FreeHelpPage() {
  const [activeSessions, setActiveSessions] = useState<HelpSession[]>([])
  const [futureSessions, setFutureSessions] = useState<HelpSession[]>([])
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
  const pixelSize :number = 2
  const [isFetchingSessions, setIsFetchingSessions] = useState<boolean>(true)

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

      // Stop polling if status is completed or no_show
      if (position?.status === 'completed' || position?.status === 'no_show') {
        return
      }

      const interval = setInterval(() => {
        fetchPosition()
      }, 5000) // Poll every 5 seconds

      return () => clearInterval(interval)
    }
  }, [queueId, position?.status])

  async function fetchActiveSessions() {
    setIsFetchingSessions(true)
    try {
      const response = await fetch(`${BASEURL}/help-sessions/active`)
      if (!response.ok) {
        console.error("Failed to fetch active sessions")
        return
      }
      const data = await response.json()
      setActiveSessions(data.sessions || [])

      // If no active sessions, fetch future sessions
      if (!data.sessions || data.sessions.length === 0) {
        await fetchFutureSessions()
      }
    } catch (error) {
      console.error("Failed to fetch active sessions:", error)
    } finally {
      setIsFetchingSessions(false)
    }
  }

  async function fetchFutureSessions() {
    try {
      const response = await fetch(`${BASEURL}/help-sessions`)
      if (!response.ok) {
        console.error("Failed to fetch future sessions")
        return
      }
      const data = await response.json()
      setFutureSessions(data.sessions || [])
    } catch (error) {
      console.error("Failed to fetch future sessions:", error)
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

    //update the server that the user has left the queue
    if (queueId) {
      fetch(`${BASEURL}/teacher/queue/${queueId}`, {
        method: "DELETE"
      }).catch((error) => {
        console.error("Failed to notify server about leaving the queue:", error)
        toast.error('Kunne ikke forlate køen. prøv igjen senere.')
      })
    }
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
        toast.error(error.error || "Noe gikk galt")
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
      toast.error("Kunne ikke bli med i køen")
    } finally {
      setLoading(false)
    }
  }

  // Show completion screen for completed or no_show status
  if (queueId && position && (position.status === 'completed' || position.status === 'no_show')) {
    const isCompleted = position.status === 'completed'

    return (
      <div className="flex flex-col items-center justify-center w-full min-h-screen bg-slate-200 dark:bg-slate-900 p-4">
        <div className="w-full md:w-4/5 max-w-2xl">
          <Card className="bg-white dark:bg-black rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-neutral-800 dark:text-neutral-200">
                {isCompleted ? '✅ Takk for at du brukte gratis leksehjelp!' : '😔 Vi savnet deg!'}
              </CardTitle>
              <CardDescription>
                {isCompleted
                  ? 'Vi håper du fikk den hjelpen du trengte!'
                  : 'Du ble markert som ikke møtt opp til økten.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                <p className="text-neutral-800 dark:text-neutral-200">
                  <strong>Emne:</strong> {formData.subject}
                </p>
                {position.completed_at && (
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Fullført: {new Date(position.completed_at).toLocaleString('no-NO')}
                  </p>
                )}
              </div>

              {/* CTA for private tutoring */}
              <div className="bg-blue-50 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
                  Trenger du mer hjelp?
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {isCompleted
                    ? 'Dersom du ønsker mer omfattende og personlig tilpasset hjelp, kan du bestille privatundervisning med våre dyktige lærere.'
                    : 'Med privatundervisning får du fleksible timer som passer inn i din timeplan, slik at du aldri går glipp av hjelpen du trenger.'}
                </p>
                <Link
                  href="/bestill"
                  className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-colors"
                >
                  Bestill privatundervisning
                </Link>
              </div>

              {/* Button to join queue again */}
              <Button
                onClick={handleLeaveQueue}
                className="w-full"
                variant="outline"
              >
                Bli med i køen igjen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
                  <>Du kan bli med i Zoom-møtet nå ved å klikke på knappen under. Du vil bli sluppet inn når det er din tur.</>
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
                      {position?.position === 1 ? "Du er neste! Gå inn i zoom-møte nå." : "Plass i køen"}
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
                    <p className="text-neutral-800 dark:text-neutral-200"><strong>Min status:</strong> {position.status === 'waiting' ? 'Venter' : position.status === 'admitted' ? 'Innrømmet' : position.status}</p>
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

              {zoomJoinLink && (<div className="flex flex-col items-center space-y-2">
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
                </div>
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

  const { theme } = useTheme()

  // Light mode: brighter, more vibrant colors
  // Dark mode: slightly darker palette
  const customPalette = theme === "light" 
    ? ["#fef3c7", "#fbbf24", "#f59e0b", "#fb923c", "#f97316", "#dc2626"]
    : ["#000000", "#f97316", "#be123c", "#ffffff"]

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-slate-200 dark:bg-slate-900">
      {/* Hero Section with Dither Shader */}
      <section className="relative h-screen w-full flex flex-col items-center justify-center">
        <div className="absolute inset-0 z-0">
          <DitherShader 
            src="/mountain_landscape.png"
            gridSize={pixelSize}
            pixelRatio={1}
            colorMode="custom"
            customPalette={customPalette}
            brightness={0.1}
            contrast={1.2}
            className="opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black" />
        </div>

        <div className="flex flex-col items-center justify-center m-4 p-4 z-10 text-center space-y-6 max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 mb-4"
          >
            GRATIS LEKSEHJELP
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-xl md:text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 mb-4"
          >
            Få hjelp fra våre lærere - helt gratis!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-lg md:text-xl text-neutral-200 max-w-2xl mx-auto leading-relaxed"
          >
            15-minutters økter med våre mentorer. Velg en lærer under og still deg i køen.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="w-full md:w-4/5 max-w-4xl space-y-4 mt-4 px-4 md:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
            Gratis Leksehjelp
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            Få hjelp fra våre lærere - helt gratis!
          </p>
          <div className="bg-white dark:bg-black p-4 rounded-lg">
            <p>Vi tilbyr gratis 15-minutters økter med våre mentorer for å hjelpe deg med dine oppgaver. <br/>
              Velg en av lærerne under og still deg i køen. Du vil mota en lenke til videomøtet per epost, du vil også få den opp på siden her.
              <br/><br/><span> Dersom du ønsker mer omfattende hjelp kan du <Link href="/bestill" className="underline">bestille privatundervisning her</Link></span>
              <br/><span className="font-light text-neutral-600 dark:text-neutral-400">Tilbudet er begrenset til én økt per student per dag.</span>
            </p>
          </div>
        </div>

        {activeSessions.length === 0 ? (
          <Card className="bg-white dark:bg-black rounded-lg">
            <CardHeader>
              <CardTitle className="text-neutral-800 dark:text-neutral-200">
                Ingen lærere tilgjengelig akkurat nå
              </CardTitle>
              <CardDescription>
                Vi har ingen lærere tilgjengelig for gratis leksehjelp akkurat nå. Neste tilgjengelige økter er vist under. Stell deg i kø når de åpner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {futureSessions.length === 0 ? (
                <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                  Ingen kommende økter planlagt ennå. Kom tilbake senere!
                </p>
              ) : (
                futureSessions.map((session) => (
                  <div
                    key={session.session_id}
                    className="p-4 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg"
                  >
                    <p className="font-semibold text-lg text-neutral-800 dark:text-neutral-200">
                      {session.teachers?.firstname} {session.teachers?.lastname}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {session.recurring ? (
                        <>
                          <strong>Hver {session.day_of_week !== null && DAYS_NO[session.day_of_week]}</strong>
                          {session.start_time && session.end_time && (
                            <>
                              {" "}
                              {(() => {
                                const timeFormatter = new Intl.DateTimeFormat("nb-NO", {
                                  timeZone: "Europe/Oslo",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                                const start = timeFormatter.format(new Date(session.start_time))
                                const end = timeFormatter.format(new Date(session.end_time))
                                return `${start} - ${end}`
                              })()}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {(() => {
                            const dateFormatter = new Intl.DateTimeFormat("nb-NO", {
                              timeZone: "Europe/Oslo",
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                            const timeFormatter = new Intl.DateTimeFormat("nb-NO", {
                              timeZone: "Europe/Oslo",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            const startDate = new Date(session.start_time)
                            const endDate = new Date(session.end_time)
                            const datePart = dateFormatter.format(startDate)
                            const startTime = timeFormatter.format(startDate)
                            const endTime = timeFormatter.format(endDate)
                            return (
                              <>
                                <strong>{datePart}</strong> {startTime} - {endTime}
                              </>
                            )
                          })()}
                        </>
                      )}
                    </p>
                  </div>
                ))
              )}
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
                {isFetchingSessions ? (
                  <div className="flex flex-col items-center justify-center py-8 text-neutral-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-2" />
                    <p>Ser etter tilgjengelige lærere...</p>
                  </div>
                ) : (
                  <>
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
                              {session.start_time && new Date(session.start_time).toLocaleDateString('no-NO', {
                                timeZone: 'Europe/Oslo',
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })} (I dag)
                            </>
                          )}
                          {" "}
                          {session.start_time && new Date(session.start_time).toLocaleTimeString('no-NO', { timeZone: 'Europe/Oslo', hour: '2-digit', minute: '2-digit' })} - {session.end_time && new Date(session.end_time).toLocaleTimeString('no-NO', { timeZone: 'Europe/Oslo', hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500">
                          {session.queue_count || 0} i kø
                        </p>
                      </div>
                    ))}
                  </>
                )}
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
                      <Label htmlFor="student_email">E-post *</Label>
                      <Input
                        id="student_email"
                        required
                        type="email"
                        value={formData.student_email}
                        onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="student_phone">Telefon *</Label>
                      <Input
                        id="student_phone"
                        required
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

      {/* Waitlist Form */}
      <div className="w-full flex justify-center mt-8 mb-8 px-4">
        <WaitlistForm />
      </div>
    </div>
  )
}
