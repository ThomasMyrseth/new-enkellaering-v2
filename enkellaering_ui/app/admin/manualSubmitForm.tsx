"use client"
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api";

const QUICK_SOURCES = [
    { value: "meta", label: "Meta" },
    { value: "google", label: "Google" },
    { value: "organic", label: "Organisk" },
] as const;

export function ManualSubmitForm() {
    const [phone, setPhone] = useState("");
    const [source, setSource] = useState<string | null>(null);
    const [customSource, setCustomSource] = useState("");
    const [comments, setComments] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isOther = source === "other";
    const resolvedSource = isOther ? customSource.trim() : source;
    const canSubmit = Boolean(phone.trim()) && Boolean(resolvedSource);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!canSubmit || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await apiFetch("/submit-new-student-manual", {
                method: "POST",
                body: {
                    phone: phone.trim(),
                    source: resolvedSource,
                    comments: comments.trim() || null,
                }
            });
            toast.success("Ny elev registrert");
            setPhone("");
            setSource(null);
            setCustomSource("");
            setComments("");
        } catch (error) {
            toast.error(error instanceof ApiError ? error.message : "Kunne ikke registrere ny elev");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (<div className="max-w-md rounded-lg w-full mx-auto md:rounded-2xl p-4 md:p-8 shadow-none bg-white dark:bg-black">
        <h2 className="text-2xl font-bold py-2">Manuell registrering av ny elev</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Registrer en ny elev manuelt og angi hvor eleven kom fra.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <Label htmlFor="phone">Telefonnummer</Label>
                <Input
                    id="phone"
                    placeholder="12345678"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>

            <div>
                <Label>Kilde</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {QUICK_SOURCES.map((s) => (
                        <Button
                            key={s.value}
                            type="button"
                            variant={source === s.value ? "default" : "outline"}
                            onClick={() => setSource(s.value)}
                        >
                            {s.label}
                        </Button>
                    ))}
                    <Button
                        type="button"
                        variant={isOther ? "default" : "outline"}
                        onClick={() => setSource("other")}
                    >
                        Annet
                    </Button>
                </div>
                {isOther && (
                    <Input
                        className={cn("mt-2")}
                        placeholder="Skriv inn kilde, f.eks. tiktok, snapchat, verv..."
                        value={customSource}
                        onChange={(e) => setCustomSource(e.target.value)}
                    />
                )}
            </div>

            <div>
                <Label htmlFor="comments">Notater</Label>
                <Textarea
                    id="comments"
                    placeholder="Lim inn eller skriv notater om eleven"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={6}
                />
            </div>

            <Button type="submit" variant="default" disabled={!canSubmit || isSubmitting} className="w-full h-10">
                Registrer ny elev
            </Button>
        </form>
    </div>)
}
