"use client"

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
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import { useQuizzes } from "@/hooks/use-quizzes"

export const DeleteQuiz = () => {
    const [quizzes, loading, error, setQuizzes] = useQuizzes();

    if (error) toast.error(error);

    const deleteQuiz = async (quizId: string) => {
        try {
            await apiFetch(`/delete-quiz`, {
                method: "POST",
                body: { quiz_ids: [quizId] },
            });

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
            <div className="w-full flex flex-col items-center">
                <Skeleton className="h-6 w-48 mt-4 mb-4" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
            </div>
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



