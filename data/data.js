// All site data (read-only for students).
window.DATA = {
  course: {
    titleEn: "Quantum Mechanics (I) (TIGP)",
    titleZh: "量子力學一（國際學程）",
    semester: "114-1",
    code: "Phys8067",
    classCode: "22ED5061",
    institute: "Institute of Physics",
    instructor: { nameZh: "李尚凡", nameEn: "Prof. Hoi-Lai Yu" },
    tas: [ { name: "Hemant Verma", affiliation: "TIGP–Nano Program (2021–Present)", email: "verma0001@as.edu.tw", phone: "+886 908 363 245" } ],
    credits: 3.0,
    yearSpan: "Fall 2025",
    type: "Elective",
    time: "Thursday 14:20–17:20",
    location: "Room P101, Institute of Physics,Academia Sinica (Meeting Room) / 中研院物理所 P101 會議室",
    language: "English",
    numbers: { NTU: "45203", NTHU: "11410TIGP743500" },
    capacity: { total: 20, outsideDeptLimit: 2 },
    description: "A graduate-level introduction to the foundations and methods of quantum mechanics, emphasizing problem solving and physical insight.",
    goals: "Build working proficiency with the formalism and apply it to nontrivial systems.",
    prerequisites: "Familiarity with advanced undergraduate quantum mechanics and mathematical methods (linear algebra, differential equations).",
    officeHours: "By appointment.",
    evaluation: [
      { item: "Homework and examinations", weight: 100 }
    ],
    policies: [
      "Respect intellectual property; no illegal reproduction of materials.",
      "Follow institute classroom conduct and exam policies."
    ],
    textbooks: [
      { type: "Textbook", title: "Quantum Physics", authors: "Stephen Gasiorowicz" }
    ],
    references: [
      { type: "Reference", title: "Quantum Mechanics (3rd ed.)", authors: "Eugen Merzbacher" },
      { type: "Reference", title: "Quantum Mechanics (2nd ed.)", authors: "Kurt Gottfried, Tung-Mow Yan" },
      { type: "Reference", title: "Lectures on Quantum Mechanics", authors: "Steven Weinberg, Cambridge Univ. Press, 2013" }
    ],
    syllabus: [
      { week: 1,  date: "9/04",  topic: "Historical introduction, photons, black‑body radiation, atomic constants, the wave function and its meaning" },
      { week: 2,  date: "9/11",  topic: "Wave packets, free particle motion, and the wave equation" },
      { week: 3,  date: "9/18",  topic: "The Schrödinger equation, the wave function and operator algebra" },
      { week: 4,  date: "9/25",  topic: "Complementarity and the Uncertainty principle" },
      { week: 5,  date: "10/02", topic: "Principles of Wave Mechanics" },
      { week: 6,  date: "10/09", topic: "Harmonic Oscillator" },
      { week: 7,  date: "10/23", topic: "One dimensional potential problems" },
      { week: 8,  date: "10/30", topic: "The WKB approximation" },
      { week: 9,  date: "11/06", topic: "Variational methods and perturbation theory" },
      { week:10,  date: "11/06", topic: "Vector spaces in Quantum Mechanics" },
      { week:11,  date: "11/13", topic: "Eigenvalues and Eigenvectors of operators" },
      { week:12,  date: "11/20", topic: "Angular momentum" },
      { week:13,  date: "11/27", topic: "The principles of quantum dynamics" },
      { week:14,  date: "12/04", topic: "Quantum dynamics of a particle, Feynman path integral" },
      { week:15,  date: "12/11", topic: "The spin, density matrix and spin polarization" },
      { week:16,  date: "12/18", topic: "Paradoxes of entanglement, the Bell inequalities" }
    ]
  },

  // Roster (IDs, bilingual names, emails, dept/notes)
  students: [
    { id: "D14222013", name: "Wazid Ahmed", nameZh: "王梓德", email: "wazid1997@as.edu.tw", dept: "NTU Physics", note: "TIGP-Nano" },
    { id: "D14222014", name: "Paawan Chandrakanth", nameZh: "帕萬", email: "chandrakant0001@as.edu.tw", dept: "NTU Physics", note: "TIGP-Nano" },
    { id: "D14222016", name: "Le Thi Phuong Thao", nameZh: "黎氏芳草", email: "thao0001@as.edu.tw", dept: "NTU Physics", note: "TIGP-Nano" },
    { id: "D14222017", name: "Tanzeela Asghar", nameZh: "唐姿菈", email: "tanzeela104c@gmail.com", dept: "NTU Physics", note: "TIGP-Nano" },
    { id: "D14222018", name: "Rehan Abid", nameZh: "雷比", email: "abid0001@as.edu.tw", dept: "NTU Physics", note: "TIGP-Nano" },
    { id: "D14222020", name: "Tsegaye Menberu Genzebu", nameZh: "澤加耶", email: "menberutsegaye6@gmail.com", dept: "NTU Physics", note: "TIGP-Nano" },
    { id: "D14222022", name: "Ujjal Bikash Parashar", nameZh: "巫賈爾", email: "ujjal70861@gmail.com", dept: "NTU Physics", note: "TIGP-Nano" },
    { id: "D13222018", name: "YOU-CHEN LIN", nameZh: "林宥成", email: "action2821@gmail.com", dept: "NTU Physics", note: "TIGP-Nano" },
    { id: "D13222019", name: "Yu-Tse Tsai", nameZh: "蔡瑀澤", email: "p89777@gmail.com", dept: "NTU Physics", note: "TIGP-Nano" },
    { id: "D13222022", name: "Muhammad Roman", nameZh: "羅孟德", email: "romanmuhammad747@gmail.com", dept: "NTU Physics", note: "TIGP-Nano" },
    { id: "114011862", name: "Chung Ling Hsuan", nameZh: "鐘翎軒", email: "nolawhite15@as.edu.tw", dept: "NTHU Engineering", note: "TIGP-Nano" }
  ],

  // Attendance records: { date: "YYYY-MM-DD", student: "<name>", status: "Present|Absent|Late|Excused", notes? }
  attendance: [
    // 2025-09-04 (Week 1): Present (all students)
    { date: "2025-09-04", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-09-04", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-09-04", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-09-04", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-09-04", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-09-04", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-09-04", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-09-04", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-09-04", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-09-04", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-09-04", student: "114011862", status: "Present" }, // Chung Ling Hsuan
    // The following were listed but not found in the roster:
    // Rehan Ullah, Mohsin Khan — can be added once confirmed

    // 2025-09-11 (Week 2): Present (all students)
    { date: "2025-09-11", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-09-11", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-09-11", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-09-11", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-09-11", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-09-11", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-09-11", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-09-11", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-09-11", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-09-11", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-09-11", student: "114011862", status: "Present" }, // Chung Ling Hsuan
    
    // 2025-09-18 (Week 3): Present (all students)
    { date: "2025-09-18", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-09-18", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-09-18", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-09-18", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-09-18", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-09-18", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-09-18", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-09-18", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-09-18", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-09-18", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-09-18", student: "114011862", status: "Present" }, // Chung Ling Hsuan

    // 2025-10-02 (Week 5): Present (all students)
    { date: "2025-10-02", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-10-02", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-10-02", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-10-02", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-10-02", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-10-02", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-10-02", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-10-02", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-10-02", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-10-02", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-10-02", student: "114011862", status: "Present" }, // Chung Ling Hsuan

    // 2025-10-09 (Week 6): Present (all students)
    { date: "2025-10-09", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-10-09", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-10-09", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-10-09", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-10-09", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-10-09", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-10-09", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-10-09", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-10-09", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-10-09", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-10-09", student: "114011862", status: "Present" }, // Chung Ling Hsuan
  ],

  // Assignments (common to all)
  assignments: [
    { id:"H1", title:"Homework 1", subject:"Quantum Mechanics", assigned:"2025-09-11", due:"2025-09-18", max: 5 },
    { id:"H2", title:"Homework 2", subject:"Quantum Mechanics", assigned:"2025-09-18", due:"2025-09-25", max: 5 },
    { id:"H3", title:"Homework 3", subject:"Quantum Mechanics", assigned:"2025-09-25", due:"2025-10-09", max: 5 }
    // example:
    // { id:"A1", title:"QM Problem Set 1", subject:"Quantum Mechanics", assigned:"2025-09-09", due:"2025-09-16", solutionUrl:"https://…" }
  ],

  // Marks per student per assignment: { assignmentId, student, marks, max }
  marks: [
    // HW-1 (max 5)
    { assignmentId:"H1", student:"D14222013", marks:5,   max:5 },
    { assignmentId:"H1", student:"D14222014", marks:5,   max:5 },
    { assignmentId:"H1", student:"D14222016", marks:5,   max:5 },
    { assignmentId:"H1", student:"D14222017", marks:5,   max:5 },
    { assignmentId:"H1", student:"D14222018", marks:5,   max:5 },
    { assignmentId:"H1", student:"D14222020", marks:4.5, max:5 },
    { assignmentId:"H1", student:"D14222022", marks:5,   max:5 },
    { assignmentId:"H1", student:"D13222018", marks:5,   max:5 },
    { assignmentId:"H1", student:"D13222019", marks:4.5, max:5 },
    { assignmentId:"H1", student:"D13222022", marks:5,   max:5 },
    { assignmentId:"H1", student:"114011862", marks:4.5, max:5 },

    // HW-2 (max 5)
    { assignmentId:"H2", student:"D14222013", marks:4.5, max:5 },
    { assignmentId:"H2", student:"D14222014", marks:5,   max:5 },
    { assignmentId:"H2", student:"D14222016", marks:4.5, max:5 },
    { assignmentId:"H2", student:"D14222017", marks:4.5, max:5 },
    { assignmentId:"H2", student:"D14222018", marks:4.5, max:5 },
    { assignmentId:"H2", student:"D14222020", marks:5,   max:5 },
    { assignmentId:"H2", student:"D14222022", marks:5,   max:5 },
    { assignmentId:"H2", student:"D13222018", marks:4.5, max:5 },
    { assignmentId:"H2", student:"D13222019", marks:4,   max:5 },
    { assignmentId:"H2", student:"D13222022", marks:4.5, max:5 },
    { assignmentId:"H2", student:"114011862", marks:4,   max:5 },

    // HW-3 (max 5)
    { assignmentId:"H3", student:"D14222013", marks:5, max:5 },
    { assignmentId:"H3", student:"D14222014", marks:5, max:5 },
    { assignmentId:"H3", student:"D14222016", marks:5, max:5 },
    { assignmentId:"H3", student:"D14222017", marks:5, max:5 },
    { assignmentId:"H3", student:"D14222018", marks:5, max:5 },
    { assignmentId:"H3", student:"D14222020", marks:5, max:5 },
    { assignmentId:"H3", student:"D14222022", marks:5, max:5 },
    { assignmentId:"H3", student:"D13222018", marks:5, max:5 },
    { assignmentId:"H3", student:"D13222019", marks:5, max:5 },
    { assignmentId:"H3", student:"D13222022", marks:5, max:5 },
    { assignmentId:"H3", student:"114011862", marks:5, max:5 }
    // { assignmentId:"A1", student:"Wazid Ahmed", marks:18, max:20 }
  ],

  // Homework announcements
  homework: [
    { id:"H1", title:"Homework 1", subject:"Quantum Mechanics", due:"2025-09-18", points: 0, link:"assets/homework/hw1.html", description: "All students submitted on time. Grades: To be announced." },
    { id:"H2", title:"Homework 2", subject:"Quantum Mechanics", due:"2025-09-25", points: 0, link:"assets/homework/hw2.html" },
    { id:"H3", title:"Homework 3", subject:"Quantum Mechanics", due:"2025-10-09", points: 0, link:"assets/homework/hw3.html", description: "Quantum Operators." },
    { id:"H4", title:"Homework 4", subject:"Quantum Mechanics", due:"2025-10-16", points: 0, description: "To be announced." }
  ],

  // Books and references table (merged for student view)
  books: [
    { type: "Reference", title: "Quantum Mechanics (3rd ed.)", authors: "Eugen Merzbacher" },
    { type: "Reference", title: "Quantum Mechanics (2nd ed.)", authors: "Kurt Gottfried, Tung-Mow Yan" },
    { type: "Reference", title: "Lectures on Quantum Mechanics", authors: "Steven Weinberg, Cambridge Univ. Press, 2013" }
  ]
};
