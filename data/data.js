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
    tas: [ { name: "Hemant Verma", affiliation: "TIGP-Nano Program (2021-Present); Office: 6B09, RCAS, Academia Sinica", email: "verma0001@as.edu.tw", phone: "+886 908 363 245", address: "6B09, RCAS, Academia Sinica" } ],
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
      { item: "Homework (11 assignments; best 10 counted)", weight: 60 },
      { item: "Mid-Sem Exam", weight: 20 },
      { item: "End-Sem Exam", weight: 20 }
    ],
    gradingNote: "Passing score is 70 (B-). Students may apply for exemption from the Written Exam at NTU if they completed the designated courses with a score of 78 (B+) or above.",
    gradingScale: [
      { letter: "A+", point: 4.3, range: "90-100", score: 95 },
      { letter: "A",  point: 4.0, range: "85-89",  score: 87 },
      { letter: "A-", point: 3.7, range: "80-84",  score: 82 },
      { letter: "B+", point: 3.3, range: "77-79",  score: 78, note: "Course Taken Score" },
      { letter: "B",  point: 3.0, range: "73-76",  score: 75 },
      { letter: "B-", point: 2.7, range: "70-72",  score: 70, note: "Passing Score" },
      { letter: "C+", point: 2.3, range: "67-69",  score: 68 },
      { letter: "C",  point: 2.0, range: "63-66",  score: 65 },
      { letter: "C-", point: 1.7, range: "60-62",  score: 60 },
      { letter: "F",  point: 0.0, range: "59 and below", score: 50 }
    ],
    policies: [
      "Respect intellectual property; no illegal reproduction of materials.",
      "Follow institute classroom conduct and exam policies.",
      "Passing score is 70 (B-).",
      "Students may apply for exemption from the NTU Written Exam if they completed the designated courses with a score of 78 (B+) or above."
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
      { week: 7,  date: "10/16", topic: "One dimensional potential problems" },
      { week: 8,  date: "10/23", topic: "The WKB approximation" },
      { week: 9,  date: "10/30", topic: "Variational methods and perturbation theory" },
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

    // 2025-09-25 (Week 4): Present (all students)
    { date: "2025-09-25", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-09-25", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-09-25", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-09-25", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-09-25", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-09-25", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-09-25", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-09-25", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-09-25", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-09-25", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-09-25", student: "114011862", status: "Present" }, // Chung Ling Hsuan

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

    

    // 2025-10-16 (Week 7): Present (all students)
    { date: "2025-10-16", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-10-16", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-10-16", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-10-16", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-10-16", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-10-16", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-10-16", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-10-16", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-10-16", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-10-16", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-10-16", student: "114011862", status: "Present" }, // Chung Ling Hsuan

    // 2025-10-23 (Week 8): Present (all students)
    { date: "2025-10-23", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-10-23", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-10-23", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-10-23", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-10-23", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-10-23", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-10-23", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-10-23", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-10-23", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-10-23", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-10-23", student: "114011862", status: "Present" }, // Chung Ling Hsuan

    // 2025-10-30 (Week 9): Present (all students)
    { date: "2025-10-30", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-10-30", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-10-30", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-10-30", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-10-30", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-10-30", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-10-30", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-10-30", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-10-30", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-10-30", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-10-30", student: "114011862", status: "Present" }, // Chung Ling Hsuan

    // 2025-11-06 (Week 10): Present (all students)
    { date: "2025-11-06", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-11-06", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-11-06", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-11-06", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-11-06", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-11-06", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-11-06", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-11-06", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-11-06", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-11-06", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-11-06", student: "114011862", status: "Present" }, // Chung Ling Hsuan

    // 2025-11-13 (Week 11): Present (all students)
    { date: "2025-11-13", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-11-13", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-11-13", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-11-13", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-11-13", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-11-13", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-11-13", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-11-13", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-11-13", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-11-13", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-11-13", student: "114011862", status: "Present" }, // Chung Ling Hsuan

    // 2025-11-20 (Week 12): Present (all students)
    { date: "2025-11-20", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-11-20", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-11-20", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-11-20", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-11-20", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-11-20", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-11-20", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-11-20", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-11-20", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-11-20", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-11-20", student: "114011862", status: "Present" }, // Chung Ling Hsuan

    // 2025-11-27 (Week 13): Present (all students)
    { date: "2025-11-27", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-11-27", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-11-27", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-11-27", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-11-27", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-11-27", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-11-27", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-11-27", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-11-27", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-11-27", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-11-27", student: "114011862", status: "Present" }, // Chung Ling Hsuan

    // 2025-12-04 (Week 14): Present (all students)
    { date: "2025-12-04", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-12-04", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-12-04", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-12-04", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-12-04", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-12-04", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-12-04", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-12-04", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-12-04", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-12-04", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-12-04", student: "114011862", status: "Present" }, // Chung Ling Hsuan

    // 2025-12-11 (Week 15): Present (all students)
    { date: "2025-12-11", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-12-11", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-12-11", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-12-11", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-12-11", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-12-11", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-12-11", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-12-11", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-12-11", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-12-11", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-12-11", student: "114011862", status: "Present" }, // Chung Ling Hsuan

    // 2025-12-18 (Week 16, End-Sem Exam): Present (all students)
    { date: "2025-12-18", student: "D14222013", status: "Present" }, // Wazid Ahmed
    { date: "2025-12-18", student: "D14222014", status: "Present" }, // Paawan Chandrakanth
    { date: "2025-12-18", student: "D14222016", status: "Present" }, // Le Thi Phuong Thao
    { date: "2025-12-18", student: "D14222017", status: "Present" }, // Tanzeela Asghar
    { date: "2025-12-18", student: "D14222018", status: "Present" }, // Rehan Abid
    { date: "2025-12-18", student: "D14222020", status: "Present" }, // Tsegaye Menberu Genzebu
    { date: "2025-12-18", student: "D14222022", status: "Present" }, // Ujjal Bikash Parashar
    { date: "2025-12-18", student: "D13222018", status: "Present" }, // YOU-CHEN LIN
    { date: "2025-12-18", student: "D13222019", status: "Present" }, // Yu-Tse Tsai
    { date: "2025-12-18", student: "D13222022", status: "Present" }, // Muhammad Roman
    { date: "2025-12-18", student: "114011862", status: "Present" }, // Chung Ling Hsuan
  ],

  // Assignments (common to all)
  assignments: [
    { id:"H1", title:"Homework 1", subject:"Quantum Mechanics", assigned:"2025-09-11", due:"2025-09-18", max: 6 },
    { id:"H2", title:"Homework 2", subject:"Quantum Mechanics", assigned:"2025-09-18", due:"2025-09-25", max: 6 },
    { id:"H3", title:"Homework 3", subject:"Quantum Mechanics", assigned:"2025-09-25", due:"2025-10-09", max: 6 },
    { id:"H4", title:"Homework 4", subject:"Quantum Mechanics", assigned:"2025-10-09", due:"2025-10-16", max: 6 },
    { id:"H5", title:"Homework 5", subject:"Quantum Mechanics", assigned:"2025-10-16", due:"2025-10-23", max: 6 },
    { id:"H6", title:"Homework 6", subject:"Quantum Mechanics", assigned:"2025-10-23", due:"2025-10-30", max: 6 },
    { id:"H7", title:"Homework 7", subject:"Quantum Mechanics", assigned:"2025-10-30", due:"2025-11-06", max: 6 },
    { id:"H8", title:"Homework 8", subject:"Quantum Mechanics", assigned:"2025-11-06", due:"2025-11-15", max: 6 },
    { id:"H9", title:"Homework 9", subject:"Quantum Mechanics", assigned:"2025-11-13", due:"2025-11-20", max: 6 },
    { id:"H10", title:"Homework 10", subject:"Quantum Mechanics", assigned:"2025-11-20", due:"2025-11-27", max: 6 },
    { id:"H11", title:"Homework 11", subject:"Quantum Mechanics", assigned:"2025-11-27", due:"2025-12-12", max: 6 },
    { id:"MID", title:"Mid-Sem Exam", subject:"Quantum Mechanics", assigned:"2025-10-30", due:"2025-10-30", max: 20 },
    { id:"END", title:"End-Sem Exam", subject:"Quantum Mechanics", assigned:"2025-12-18", due:"2025-12-18", max: 20 }
    // example:
    // { id:"A1", title:"QM Problem Set 1", subject:"Quantum Mechanics", assigned:"2025-09-09", due:"2025-09-16", solutionUrl:"https://…" }
  ],

  // Marks per student per assignment: { assignmentId, student, marks, max }
  marks: [
    // HW-1 (max 6)
    { assignmentId:"H1", student:"D14222013", marks:6,   max:6 },
    { assignmentId:"H1", student:"D14222014", marks:6,   max:6 },
    { assignmentId:"H1", student:"D14222016", marks:6,   max:6 },
    { assignmentId:"H1", student:"D14222017", marks:6,   max:6 },
    { assignmentId:"H1", student:"D14222018", marks:6,   max:6 },
    { assignmentId:"H1", student:"D14222020", marks:5.4, max:6 },
    { assignmentId:"H1", student:"D14222022", marks:6,   max:6 },
    { assignmentId:"H1", student:"D13222018", marks:6,   max:6 },
    { assignmentId:"H1", student:"D13222019", marks:5.4, max:6 },
    { assignmentId:"H1", student:"D13222022", marks:6,   max:6 },
    { assignmentId:"H1", student:"114011862", marks:5.4, max:6 },

    // HW-2 (max 6)
    { assignmentId:"H2", student:"D14222013", marks:5.4, max:6 },
    { assignmentId:"H2", student:"D14222014", marks:6,   max:6 },
    { assignmentId:"H2", student:"D14222016", marks:5.4, max:6 },
    { assignmentId:"H2", student:"D14222017", marks:5.4, max:6 },
    { assignmentId:"H2", student:"D14222018", marks:5.4, max:6 },
    { assignmentId:"H2", student:"D14222020", marks:6,   max:6 },
    { assignmentId:"H2", student:"D14222022", marks:6,   max:6 },
    { assignmentId:"H2", student:"D13222018", marks:5.4, max:6 },
    { assignmentId:"H2", student:"D13222019", marks:4.8, max:6 },
    { assignmentId:"H2", student:"D13222022", marks:5.4, max:6 },
    { assignmentId:"H2", student:"114011862", marks:4.8, max:6 },

    // HW-3 (max 6)
    { assignmentId:"H3", student:"D14222013", marks:6, max:6 },
    { assignmentId:"H3", student:"D14222014", marks:6, max:6 },
    { assignmentId:"H3", student:"D14222016", marks:6, max:6 },
    { assignmentId:"H3", student:"D14222017", marks:6, max:6 },
    { assignmentId:"H3", student:"D14222018", marks:6, max:6 },
    { assignmentId:"H3", student:"D14222020", marks:6, max:6 },
    { assignmentId:"H3", student:"D14222022", marks:6, max:6 },
    { assignmentId:"H3", student:"D13222018", marks:6, max:6 },
    { assignmentId:"H3", student:"D13222019", marks:6, max:6 },
    { assignmentId:"H3", student:"D13222022", marks:6, max:6 },
    { assignmentId:"H3", student:"114011862", marks:6, max:6 },

    // HW-4 (max 6)
    { assignmentId:"H4", student:"D14222013", marks:6, max:6 },
    { assignmentId:"H4", student:"D14222014", marks:6, max:6 },
    { assignmentId:"H4", student:"D14222016", marks:6, max:6 },
    { assignmentId:"H4", student:"D14222017", marks:6, max:6 },
    { assignmentId:"H4", student:"D14222018", marks:6, max:6 },
    { assignmentId:"H4", student:"D14222020", marks:6, max:6 },
    { assignmentId:"H4", student:"D14222022", marks:6, max:6 },
    { assignmentId:"H4", student:"D13222018", marks:6, max:6 },
    { assignmentId:"H4", student:"D13222019", marks:6, max:6 },
    { assignmentId:"H4", student:"D13222022", marks:6, max:6 },
    { assignmentId:"H4", student:"114011862", marks:6, max:6 },

    // HW-5 (max 6)
    { assignmentId:"H5", student:"D14222013", marks:6, max:6 },
    { assignmentId:"H5", student:"D14222014", marks:6, max:6 },
    { assignmentId:"H5", student:"D14222016", marks:6, max:6 },
    { assignmentId:"H5", student:"D14222017", marks:6, max:6 },
    { assignmentId:"H5", student:"D14222018", marks:6, max:6 },
    { assignmentId:"H5", student:"D14222020", marks:6, max:6 },
    { assignmentId:"H5", student:"D14222022", marks:6, max:6 },
    { assignmentId:"H5", student:"D13222018", marks:6, max:6 },
    { assignmentId:"H5", student:"D13222019", marks:6, max:6 },
    { assignmentId:"H5", student:"D13222022", marks:6, max:6 },
    { assignmentId:"H5", student:"114011862", marks:6, max:6 },

    // Mid-Sem Exam (max 20)
    { assignmentId:"MID", student:"D14222013", marks:20,   max:20 }, // Wazid Ahmed
    { assignmentId:"MID", student:"D14222014", marks:18,   max:20 }, // Paawan Chandrakanth
    { assignmentId:"MID", student:"D14222016", marks:20,   max:20 }, // Le Thi Phuong Thao
    { assignmentId:"MID", student:"D14222017", marks:17,   max:20 }, // Tanzeela Asghar
    { assignmentId:"MID", student:"D14222018", marks:20,   max:20 }, // Rehan Abid
    { assignmentId:"MID", student:"D14222020", marks:12,   max:20 }, // Tsegaye Menberu Genzebu
    { assignmentId:"MID", student:"D14222022", marks:20,   max:20 }, // Ujjal Bikash Parashar
    { assignmentId:"MID", student:"D13222018", marks:13.5, max:20 }, // YOU-CHEN LIN
    { assignmentId:"MID", student:"D13222019", marks:17,   max:20 }, // Yu-Tse Tsai
    { assignmentId:"MID", student:"D13222022", marks:15.5, max:20 }, // Muhammad Roman
    { assignmentId:"MID", student:"114011862", marks:8,    max:20 }, // Chung Ling Hsuan

    // HW-6 (max 6)
    { assignmentId:"H6", student:"D14222013", marks:6, max:6 },
    { assignmentId:"H6", student:"D14222014", marks:6, max:6 },
    { assignmentId:"H6", student:"D14222016", marks:6, max:6 },
    { assignmentId:"H6", student:"D14222017", marks:6, max:6 },
    { assignmentId:"H6", student:"D14222018", marks:6, max:6 },
    { assignmentId:"H6", student:"D14222020", marks:6, max:6 },
    { assignmentId:"H6", student:"D14222022", marks:6, max:6 },
    { assignmentId:"H6", student:"D13222018", marks:6, max:6 },
    { assignmentId:"H6", student:"D13222019", marks:6, max:6 },
    { assignmentId:"H6", student:"D13222022", marks:6, max:6 },
    { assignmentId:"H6", student:"114011862", marks:6, max:6 },

    // HW-7 (max 6)
    { assignmentId:"H7", student:"D14222013", marks:6, max:6 },
    { assignmentId:"H7", student:"D14222014", marks:6, max:6 },
    { assignmentId:"H7", student:"D14222016", marks:6, max:6 },
    { assignmentId:"H7", student:"D14222017", marks:6, max:6 },
    { assignmentId:"H7", student:"D14222018", marks:6, max:6 },
    { assignmentId:"H7", student:"D14222020", marks:6, max:6 },
    { assignmentId:"H7", student:"D14222022", marks:6, max:6 },
    { assignmentId:"H7", student:"D13222018", marks:6, max:6 },
    { assignmentId:"H7", student:"D13222019", marks:6, max:6 },
    { assignmentId:"H7", student:"D13222022", marks:6, max:6 },
    { assignmentId:"H7", student:"114011862", marks:6, max:6 },

    // HW-8 (max 6)
    { assignmentId:"H8", student:"D14222013", marks:6, max:6 },
    { assignmentId:"H8", student:"D14222014", marks:6, max:6 },
    { assignmentId:"H8", student:"D14222016", marks:6, max:6 },
    { assignmentId:"H8", student:"D14222017", marks:6, max:6 },
    { assignmentId:"H8", student:"D14222018", marks:6, max:6 },
    { assignmentId:"H8", student:"D14222020", marks:6, max:6 },
    { assignmentId:"H8", student:"D14222022", marks:6, max:6 },
    { assignmentId:"H8", student:"D13222018", marks:5.4, max:6 },
    { assignmentId:"H8", student:"D13222019", marks:5.4, max:6 },
    { assignmentId:"H8", student:"D13222022", marks:6, max:6 },
    { assignmentId:"H8", student:"114011862", marks:6, max:6 },

    // HW-9 (max 6)
    { assignmentId:"H9", student:"D14222013", marks:6,   max:6 }, // Wazid Ahmed
    { assignmentId:"H9", student:"D14222014", marks:5.4, max:6 }, // Paawan Chandrakanth
    { assignmentId:"H9", student:"D14222016", marks:6,   max:6 }, // Le Thi Phuong Thao
    { assignmentId:"H9", student:"D14222017", marks:6,   max:6 }, // Tanzeela Asghar
    { assignmentId:"H9", student:"D14222018", marks:6,   max:6 }, // Rehan Abid
    { assignmentId:"H9", student:"D14222020", marks:6,   max:6 }, // Tsegaye Menberu Genzebu
    { assignmentId:"H9", student:"D14222022", marks:6,   max:6 }, // Ujjal Bikash Parashar
    { assignmentId:"H9", student:"D13222018", marks:6,   max:6 }, // YOU-CHEN LIN
    { assignmentId:"H9", student:"D13222019", marks:6,   max:6 }, // Yu-Tse Tsai
    { assignmentId:"H9", student:"D13222022", marks:6,   max:6 }, // Muhammad Roman
    { assignmentId:"H9", student:"114011862", marks:6,   max:6 }, // Chung Ling Hsuan

    // HW-10 (max 6)
    { assignmentId:"H10", student:"D14222013", marks:6,   max:6 }, // Wazid Ahmed
    { assignmentId:"H10", student:"D14222014", marks:6,   max:6 }, // Paawan Chandrakanth
    { assignmentId:"H10", student:"D14222016", marks:6,   max:6 }, // Le Thi Phuong Thao
    { assignmentId:"H10", student:"D14222017", marks:6,   max:6 }, // Tanzeela Asghar
    { assignmentId:"H10", student:"D14222018", marks:6,   max:6 }, // Rehan Abid
    { assignmentId:"H10", student:"D14222020", marks:6,   max:6 }, // Tsegaye Menberu Genzebu
    { assignmentId:"H10", student:"D14222022", marks:6,   max:6 }, // Ujjal Bikash Parashar
    { assignmentId:"H10", student:"D13222018", marks:4.8, max:6 }, // YOU-CHEN LIN
    { assignmentId:"H10", student:"D13222019", marks:6,   max:6 }, // Yu-Tse Tsai
    { assignmentId:"H10", student:"D13222022", marks:6,   max:6 }, // Muhammad Roman
    { assignmentId:"H10", student:"114011862", marks:6,   max:6 }, // Chung Ling Hsuan

    // HW-11 (max 6)
    { assignmentId:"H11", student:"D14222013", marks:6,   max:6 }, // Wazid Ahmed
    { assignmentId:"H11", student:"D14222014", marks:6,   max:6 }, // Paawan Chandrakanth
    { assignmentId:"H11", student:"D14222016", marks:6,   max:6 }, // Le Thi Phuong Thao
    { assignmentId:"H11", student:"D14222017", marks:6,   max:6 }, // Tanzeela Asghar
    { assignmentId:"H11", student:"D14222018", marks:6,   max:6 }, // Rehan Abid
    { assignmentId:"H11", student:"D14222020", marks:6,   max:6 }, // Tsegaye Menberu Genzebu
    { assignmentId:"H11", student:"D14222022", marks:6,   max:6 }, // Ujjal Bikash Parashar
    { assignmentId:"H11", student:"D13222018", marks:6,   max:6 }, // YOU-CHEN LIN
    { assignmentId:"H11", student:"D13222019", marks:6,   max:6 }, // Yu-Tse Tsai
    { assignmentId:"H11", student:"D13222022", marks:6,   max:6 }, // Muhammad Roman
    { assignmentId:"H11", student:"114011862", marks:6,   max:6 }, // Chung Ling Hsuan

    // End-Sem Exam (max 20)
    { assignmentId:"END", student:"D14222020", marks:13.5, max:20 }, // Tsegaye Menberu Genzebu
    { assignmentId:"END", student:"D14222016", marks:16,   max:20 }, // Le Thi Phuong Thao
    { assignmentId:"END", student:"D13222022", marks:15.8, max:20 }, // Muhammad Roman
    { assignmentId:"END", student:"D14222017", marks:13.5, max:20 }, // Tanzeela Asghar
    { assignmentId:"END", student:"D13222019", marks:17,   max:20 }, // Yu-Tse Tsai
    { assignmentId:"END", student:"D14222018", marks:17.5, max:20 }, // Rehan Abid
    { assignmentId:"END", student:"D14222014", marks:18.5, max:20 }, // Paawan Chandrakanth
    { assignmentId:"END", student:"D14222022", marks:18,   max:20 }, // Ujjal Bikash Parashar
    { assignmentId:"END", student:"114011862", marks:2,    max:20 }, // Chung Ling Hsuan
    { assignmentId:"END", student:"D13222018", marks:16,   max:20 }, // YOU-CHEN LIN
    { assignmentId:"END", student:"D14222013", marks:19,   max:20 }, // Wazid Ahmed
  ],

  // Homework announcements
  homework: [
    { id:"H1", title:"Homework 1", subject:"Quantum Mechanics", due:"2025-09-18", points: 0, link:"assets/homework/hw1.html", description: "All students submitted on time. Grades: To be announced." },
    { id:"H2", title:"Homework 2", subject:"Quantum Mechanics", due:"2025-09-25", points: 0, link:"assets/homework/hw2.html" },
    { id:"H3", title:"Homework 3", subject:"Quantum Mechanics", due:"2025-10-09", points: 0, link:"assets/homework/hw3.html", description: "Quantum Operators." },
    { id:"H4", title:"Homework 4", subject:"Quantum Mechanics", due:"2025-10-16", points: 0, link:"assets/homework/hw4.html", description: "See the assignment page." },
    { id:"H5", title:"Homework 5", subject:"Quantum Mechanics", due:"2025-10-23", points: 0, description: "Grades will be announced on 23 Oct." },
    { id:"H6", title:"Homework 6", subject:"Quantum Mechanics", due:"2025-10-30", points: 0, description: "Will be collected." },
    { id:"H7", title:"Homework 7", subject:"Quantum Mechanics", due:"2025-11-06", points: 0, link:"assets/homework/Homework-6_Problem.pdf", description: "Problem PDF updated." },
    { id:"H8", title:"Homework 8", subject:"Quantum Mechanics", due:"2025-11-15", points: 0, link:"assets/homework/hw8.html", description: "Expectation Values and Angular Momentum Coupling" },
    { id:"H9", title:"Homework 9", subject:"Quantum Mechanics", due:"2025-11-20", points: 0, link:"assets/homework/hw9.html", description: "Lorentz force from Hamiltonian; probability current with vector potential." },
    { id:"H10", title:"Homework 10", subject:"Quantum Mechanics", due:"2025-11-27", points: 0, link:"assets/homework/hw10.html", description: "Lorentz force from Hamiltonian; probability current with vector potential." },
    { id:"H11", title:"Homework 11", subject:"Quantum Mechanics", due:"2025-12-12", points: 0, link:"assets/homework/hw11.html", description: "Please refer to the PDF assignment for complete problem statements." }
  ],

  // Books and references table (merged for student view)
  books: [
    { type: "Reference", title: "Quantum Mechanics (3rd ed.)", authors: "Eugen Merzbacher" },
    { type: "Reference", title: "Quantum Mechanics (2nd ed.)", authors: "Kurt Gottfried, Tung-Mow Yan" },
    { type: "Reference", title: "Lectures on Quantum Mechanics", authors: "Steven Weinberg, Cambridge Univ. Press, 2013" }
  ]
};
