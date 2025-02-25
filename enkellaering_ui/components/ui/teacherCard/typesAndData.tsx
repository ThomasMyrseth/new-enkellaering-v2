import { Teacher, Review } from "@/app/admin/types";


export type CardType = {
    teacher: Teacher;
    reviews: Review[];
    location :string;
    qualifications: string[] //R1, Ungdomskole, Spansk
    description: string; //Jeg heter Thomas og er ...
    src: string; //bilde av meg
    digitalTutouring: boolean; //true=Ja til digitalt, false=Nei til digitalt
    physicalTutouring: boolean //true=Ja til fysisk, false= Nei til fysisk
}




export const cities :string[] = ['Oslo', 'Trondheim', 'Annet']
export const qualifications :string[] = ['1P', '1T', '2P', 'S1', 'S2', 'R1', 'R2', 'Matte ungdomskole', 'Annet']



export const cards: CardType[] = [
  {
      teacher: {
          user_id: '1',
          firstname: "Thomas",
          lastname: "Myrseth",
          email: "thomas@example.com",
          phone: "12345678",
          address: "Oslo, Norway",
          postal_code: "0001",
          hourly_pay: "500 NOK",
          resgined: false,
          additional_comments: null,
          created_at: "2024-01-01T12:00:00Z",
          admin: false,
          resigned_at: null,
          wants_more_students: true,
          notes: "Specialist in mathematics and language tutoring."
      },
      reviews: [
          {
              id: '1',
              teacher_user_id: '1',
              student_user_id: '10',
              created_at: "2024-02-15T10:00:00Z",
              rating: 5,
              comment: "Fantastisk lærer! Veldig engasjert og hjelpsom.",
              student_name: "Arne Elevsen"
          }
      ],
      location: "Oslo",
      qualifications: ["R1", "Ungdomsskole", "Spansk"],
      description: 
          "Jeg heter Thomas og er en erfaren privatlærer med en dyp lidenskap for undervisning. Med mange års erfaring innen matematikk, ungdomsskolefag og språk, hjelper jeg studenter med å forstå komplekse konsepter på en enkel og engasjerende måte.",
      src: "https://assets.aceternity.com/demos/thomas.jpeg",
      digitalTutouring: true,
      physicalTutouring: true
  },
  {
      teacher: {
          user_id: '2',
          firstname: "Lana",
          lastname: "Del Rey",
          email: "lana@example.com",
          phone: "87654321",
          address: "Los Angeles, USA",
          postal_code: "90001",
          hourly_pay: "N/A",
          resgined: true,
          additional_comments: "Unavailable for tutoring",
          created_at: "2023-12-15T15:30:00Z",
          admin: false,
          resigned_at: "2024-02-10T10:00:00Z",
          wants_more_students: false,
          notes: "Music and songwriting specialist."
      },
      reviews: [],
      location: "Oslo",
      qualifications: ["Musikk", "Lyrikk", "Sangskriving"],
      description: 
          "Jeg heter Lana Del Rey, en amerikansk sanger og låtskriver kjent for min unike musikalske stil som kombinerer melankoli, vintage glamour og poetisk historiefortelling.",
      src: "https://assets.aceternity.com/demos/lana-del-rey.jpeg",
      digitalTutouring: false,
      physicalTutouring: false
  },
  {
      teacher: {
          user_id: '3',
          firstname: "Babbu",
          lastname: "Maan",
          email: "babbu@example.com",
          phone: "98765432",
          address: "Punjab, India",
          postal_code: "140001",
          hourly_pay: "800 INR",
          resgined: false,
          additional_comments: "Available for Punjabi music training",
          created_at: "2022-11-10T09:45:00Z",
          admin: false,
          resigned_at: null,
          wants_more_students: true,
          notes: "Singer-songwriter and poet with deep cultural roots."
      },
      reviews: [
          {
              id : '2',
              teacher_user_id: '3',
              student_user_id: '15',
              created_at: "2024-03-10T14:30:00Z",
              rating: 4,
              comment: "Veldig bra musikkundervisning, men ønsker mer struktur i timene. Veldig bra musikkundervisning, men ønsker mer struktur i timene. Veldig bra musikkundervisning, men ønsker mer struktur i timene. Veldig bra musikkundervisning, men ønsker mer struktur i timene. Veldig bra musikkundervisning, men ønsker mer struktur i timene. Veldig bra musikkundervisning, men ønsker mer struktur i timene. ",
              student_name: ""
          },
          {
            id : '3',
            teacher_user_id: '3',
            student_user_id: '15',
            created_at: "2024-03-10T14:30:00Z",
            rating: 3,
            comment: "Flink type særlig imponert av banener",
            student_name: "Andreas"
        }
      ],
      location: "Åndasnes",
      qualifications: ["Musikk", "Sangskriving", "Poet"],
      description: 
          "Jeg heter Babbu Maan, en legendarisk Punjabi-sanger, låtskriver og skuespiller med en dyp lidenskap for å bevare og formidle den rike kulturen og arven fra Punjab.",
      src: "https://assets.aceternity.com/demos/babbu-maan.jpeg",
      digitalTutouring: true,
      physicalTutouring: true
  }
];
