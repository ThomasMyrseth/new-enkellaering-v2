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
    } catch (e: unknown) {
      if (e instanceof Error) {
        throw new Error(`Failed to get new students: ${e.message}`);
      }
      throw new Error("Failed to get new students: Unknown error");
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
    } 
    catch (e: unknown) {
      if (e instanceof Error) {
        throw new Error(`Failed to cansel new order: ${e.message}`);
      }
      throw new Error("Failed to cansel new order: Unknown error");
  }
};



// Define an interface for the teacher image and about me object.
export interface TeacherImageAndAboutMe {
    about_me: string;
    firstname: string;
    lastname: string;
    user_id: string;
    image: string;
  }
  
  // Get all teacher images and about me texts.
const getAllTeacherImagesAndAboutMes = async (
    BASEURL: string,
    token: string
  ): Promise<TeacherImageAndAboutMe[]> => {
    try {
      const res = await fetch(`${BASEURL}/get-all-teacher-images-and-about-mes`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      if (!res.ok) {
        throw new Error(
          `Failed to fetch teacher images and about me: ${res.status} ${res.statusText}`
        );
      }
  
      const data = await res.json();
      return (data.data as TeacherImageAndAboutMe[]) || [];
    }
    catch (e: unknown) {
      if (e instanceof Error) {
        throw new Error(`Failed to fetch teacher images and about mes: ${e.message}`);
      }
      throw new Error("Failed to fetch teacher images and about mes: Unknown error");
  }
};

export { getNewTeachers, canselNewOrder, getAllTeacherImagesAndAboutMes };