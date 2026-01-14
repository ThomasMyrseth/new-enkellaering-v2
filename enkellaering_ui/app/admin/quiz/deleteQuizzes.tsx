"use client"

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export const DeleteQuiz = () => {
    const BASEURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080';
    const token = localStorage.getItem('token')

    const [quizzes, setQuizzes] = useState<{ quiz_id: string; title: string }[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchAllQuizzes();
    }, []);

    const fetchAllQuizzes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASEURL}/get-all-quizzes`,  {
                method: "GET",
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                    // Do not set 'Content-Type'; let the browser set it for FormData
                },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch quizzes");
            }

            const data = await res.json();
            setQuizzes(data.quizzes || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteQuiz = async (quizId: string) => {
        try {
            const res = await fetch(`${BASEURL}/delete-quiz`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ quiz_ids: [quizId] }),
            });

            if (!res.ok) {
                toast.error(`Failed to delete quiz ${res.statusText}`)
                return
            }

            toast.success("Quiz deleted successfully")
            setQuizzes((prev) => prev.filter((quiz) => quiz.quiz_id !== quizId));
        } catch (err) {
            toast.error(`Failed to delete quiz: ${err}`)
            console.error(err);
        }
    };

    return (
        <div className="w-full bg-white dark:bg-black rounded-sm shadow-lg p-4">
          <h2 className="w-full text-center text-xl font-semibold mb-4">Delete a Quiz</h2>
          {loading ? (
            <p>Loading quizzes...</p>
          ) : (
            <Table className="">
              <TableCaption>
                List of quizzes available for deletion
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz Title</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="">
                {quizzes.map((quiz) => (
                  <TableRow key={quiz.quiz_id}>
                    <TableCell>{quiz.title}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        onClick={() => deleteQuiz(quiz.quiz_id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
    )
};



