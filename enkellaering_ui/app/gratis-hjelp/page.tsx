"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { HelpSession, HelpQueueEntry } from "../admin/types"
import { event } from '@/components/facebookPixel/fpixel'

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

  useEffect(() => {
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
        return
      }
      const data = await response.json()
      setPosition(data.position)
    } catch (error) {
      console.error("Failed to fetch position:", error)
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
        alert(error.error || "Noe gikk galt")
        setLoading(false)
        return
      }

      const data = await response.json()
      setQueueId(data.queue_id)
      setZoomJoinLink(data.zoom_join_link)
      alert(data.message)
    } catch (error) {
      console.error("Failed to join queue:", error)
      alert("Kunne ikke bli med i køen")
    } finally {
      setLoading(false)
    }
  }

  if (queueId && position) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Du er i køen!</CardTitle>
            <CardDescription>Din posisjon oppdateres automatisk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                {position.position || "..."}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {position.position === 1 ? "Du er neste!" : "Plass i køen"}
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <p><strong>Emne:</strong> {formData.subject}</p>
              <p><strong>Status:</strong> {position.status === 'waiting' ? 'Venter' : position.status === 'admitted' ? 'Innrømmet' : position.status}</p>
              {position.admitted_at && (
                <p className="text-green-600 dark:text-green-400">
                  <strong>Du er innrømmet!</strong> Sjekk Zoom-linken.
                </p>
              )}
            </div>

            {zoomJoinLink && (
              <Button className="w-full" asChild>
                <a href={zoomJoinLink} target="_blank" rel="noopener noreferrer">
                  Åpne Zoom
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Gratis Leksehjelp
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Få hjelp fra våre lærere - helt gratis!
          </p>
        </div>

        {activeSessions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Ingen aktive økter akkurat nå. Prøv igjen senere!
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Velg lærer eller snarest ledig</CardTitle>
                <CardDescription>
                  Velg en spesifikk lærer eller "Snarest" for å få hjelp raskest mulig
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  onClick={() => setSelectedSession("snarest")}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedSession === "snarest"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                    }`}
                >
                  <p className="font-semibold text-lg">Snarest ledig</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Bli automatisk tildelt til læreren med kortest kø
                  </p>
                </div>

                {activeSessions.map((session) => (
                  <div
                    key={session.session_id}
                    onClick={() => setSelectedSession(session.session_id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedSession === session.session_id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                      }`}
                  >
                    <p className="font-semibold text-lg">
                      {session.teacher_firstname} {session.teacher_lastname}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {DAYS_NO[session.day_of_week]} {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {session.queue_count || 0} i kø
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {selectedSession && (
              <Card>
                <form onSubmit={handleSubmit}>
                  <CardHeader>
                    <CardTitle>Fyll inn dine detaljer</CardTitle>
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
