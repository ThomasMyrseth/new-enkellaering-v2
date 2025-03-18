import { TeacherOrderJoinTeacher } from "../types";

// Get all the new orders
const getNewTeachers = async (BASEURL: string, token: string): Promise<TeacherOrderJoinTeacher[]> => {
    try {
        const res = await fetch(`${BASEURL}/get-new-orders`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch new teachers: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        return data.teachers as TeacherOrderJoinTeacher[] || [];
    } catch (e: any) {
        throw new Error(`Failed to get new students: ${e.message}`);
    }
};

const canselNewOrder = async (BASEURL :string, token :string, row_id :string) :Promise<boolean> => {
    try {
        const res = await fetch(`${BASEURL}/cansel-new-order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ row_id })
        });

        if (!res.ok) {
            throw new Error(`Failed to cansel new order: ${res.status} ${res.statusText}`);
        }

        return true;
    } catch (e: any) {
        throw new Error(`Failed to cansel new order: ${e.message}`);
    }
};


// // Update a new order
// const updateNewStudent = async (BASEURL: string, token: string, studentOrder: TeacherOrder): Promise<boolean> => {
//     try {
//         const res = await fetch(`${BASEURL}/update-new-student-order`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${token}`
//             },
//             body: JSON.stringify({ student_order: studentOrder })
//         });

//         if (!res.ok) {
//             throw new Error(`Failed to update student order: ${res.status} ${res.statusText}`);
//         }

//         return true;
//     } catch (e: any) {
//         throw new Error(`Failed to update new student: ${e.message}`);
//     }
// };



export { getNewTeachers, canselNewOrder };