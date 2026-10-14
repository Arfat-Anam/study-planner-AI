import { 
  UserProfile, 
  StudyPlan, 
  Task, 
  UpcomingExam, 
  StudyNote, 
  Flashcard, 
  Quiz, 
  FocusSessionRecord 
} from '../types';

const STORAGE_KEYS = {
  USER: 'studypilot_user',
  PLAN: 'studypilot_plan',
  TASKS: 'studypilot_tasks',
  EXAMS: 'studypilot_exams',
  NOTES: 'studypilot_notes',
  CARDS: 'studypilot_cards',
  QUIZZES: 'studypilot_quizzes',
  SESSIONS: 'studypilot_sessions',
};

// Initial realistic seed data
const DEFAULT_USER: UserProfile = {
  name: 'Alex Rivera',
  major: 'Computer Science & Mathematics',
  avatarUrl: '/src/assets/images/avatar_student_user_1791990984118.jpg',
  weeklyGoalHours: 24,
  streakDays: 7,
  totalStudyMinutes: 1380, // 23 hours logged
  completedTasksCount: 16,
};

const DEFAULT_PLAN: StudyPlan = {
  id: 'plan-seed-01',
  title: 'Midterm Acceleration & Deep Mastery',
  summary: 'Targeted high-yield schedule balancing advanced Calculus, Data Structures, and Physics with interleaved active recall and Pomodoro focus blocks.',
  strategyNotes: [
    'Cognitive peak alignment: High-difficulty proofs and derivations scheduled in the 09:00 - 11:30 morning window.',
    'Interleaved practice: Switch between algorithmic coding and physics conceptual problem-solving.',
    'Active recall: End each afternoon session with 15 minutes of blurting and flashcard review.',
  ],
  createdAt: new Date().toISOString(),
  active: true,
  totalDays: 7,
  schedule: [
    {
      day: 'Day 1 - Monday',
      date: 'Today',
      focusTheme: 'Multivariable Calculus & Algorithm Invariants',
      timeBlocks: [
        {
          id: 'b-1-1',
          time: '09:00 - 10:30',
          subject: 'Mathematics',
          topic: 'Stokes Theorem & Vector Line Integrals',
          activity: 'Derivation review & 4 textbook problem set exercises',
          durationMinutes: 90,
          priority: 'high',
          studyTechnique: 'Feynman Technique',
          checkpointGoal: 'Solve 3 parametric surface orientation problems without notes',
          completed: true,
        },
        {
          id: 'b-1-2',
          time: '11:00 - 12:15',
          subject: 'Computer Science',
          topic: 'Red-Black Tree Rotations',
          activity: 'Left and right rotation tracing & node recoloring invariants',
          durationMinutes: 75,
          priority: 'high',
          studyTechnique: 'Active Recall',
          checkpointGoal: 'Implement insertion fixup cases in scratch pseudocode',
          completed: false,
        },
        {
          id: 'b-1-3',
          time: '14:00 - 15:30',
          subject: 'Physics',
          topic: 'Faraday’s Law & Lenz’s Law',
          activity: 'Induced EMF calculations with time-varying magnetic fields',
          durationMinutes: 90,
          priority: 'medium',
          studyTechnique: 'Interleaved Practice',
          checkpointGoal: 'Complete past exam problem set #4',
          completed: false,
        },
        {
          id: 'b-1-4',
          time: '16:30 - 17:15',
          subject: 'General',
          topic: 'Daily Consolidation & Flashcards',
          activity: 'Review 20 spaced repetition cards + update study notes',
          durationMinutes: 45,
          priority: 'low',
          studyTechnique: 'Spaced Repetition',
          checkpointGoal: 'Clear today’s due card queue with zero unreviewed items',
          completed: false,
        },
      ],
    },
    {
      day: 'Day 2 - Tuesday',
      date: 'Tomorrow',
      focusTheme: 'Electromagnetism & Graph Traversal Algorithms',
      timeBlocks: [
        {
          id: 'b-2-1',
          time: '09:00 - 10:30',
          subject: 'Computer Science',
          topic: 'Dijkstra & A* Shortest Path',
          activity: 'Priority queue implementation & admissibility proof',
          durationMinutes: 90,
          priority: 'high',
          studyTechnique: 'Problem-Solving Drills',
          checkpointGoal: 'Trace Dijkstra on directed negative-weight counterexample',
          completed: false,
        },
        {
          id: 'b-2-2',
          time: '11:00 - 12:30',
          subject: 'Physics',
          topic: 'Maxwell-Ampere Law & Displacement Current',
          activity: 'Capacitor charging circuit paradox resolution',
          durationMinutes: 90,
          priority: 'high',
          studyTechnique: 'Feynman Technique',
          checkpointGoal: 'Write 1-page explanation of why displacement current is needed',
          completed: false,
        },
        {
          id: 'b-2-3',
          time: '15:00 - 16:15',
          subject: 'Mathematics',
          topic: 'Divergence Theorem Practice',
          activity: 'Flux integrals through closed cylinders and spheres',
          durationMinutes: 75,
          priority: 'medium',
          studyTechnique: 'Active Recall',
          checkpointGoal: 'Verify divergence theorem on 2 spherical coordinate cases',
          completed: false,
        },
      ],
    },
    {
      day: 'Day 3 - Wednesday',
      date: 'Wed',
      focusTheme: 'Mid-Week Review & Chemistry Thermodynamics',
      timeBlocks: [
        {
          id: 'b-3-1',
          time: '09:30 - 11:00',
          subject: 'Chemistry',
          topic: 'Gibbs Free Energy & Chemical Equilibrium',
          activity: 'Van \'t Hoff equation derivations and equilibrium shifts',
          durationMinutes: 90,
          priority: 'high',
          studyTechnique: 'Worked Examples',
          checkpointGoal: 'Calculate delta G at non-standard temperatures',
          completed: false,
        },
        {
          id: 'b-3-2',
          time: '13:30 - 15:00',
          subject: 'Computer Science',
          topic: 'Dynamic Programming: Knapsack & Longest Common Subsequence',
          activity: 'Memoization table drawing & bottom-up state formulation',
          durationMinutes: 90,
          priority: 'high',
          studyTechnique: 'Active Coding',
          checkpointGoal: 'Write recurrence relation and test on 3 edge cases',
          completed: false,
        },
      ],
    },
    {
      day: 'Day 4 - Thursday',
      date: 'Thu',
      focusTheme: 'Calculus Deep Dive & Proof Formulations',
      timeBlocks: [
        {
          id: 'b-4-1',
          time: '09:00 - 10:45',
          subject: 'Mathematics',
          topic: 'Green’s Theorem & Circulation Integrals',
          activity: 'Area calculation via line integrals with planimeter intuition',
          durationMinutes: 105,
          priority: 'high',
          studyTechnique: 'Concept Mapping',
          checkpointGoal: 'Master clockwise vs counter-clockwise boundary orientation',
          completed: false,
        },
        {
          id: 'b-4-2',
          time: '14:00 - 15:30',
          subject: 'Physics',
          topic: 'RLC Resonant Circuits & Quality Factor',
          activity: 'Differential equation solution for damped harmonic oscillator',
          durationMinutes: 90,
          priority: 'medium',
          studyTechnique: 'Problem Drills',
          checkpointGoal: 'Determine resonance frequency and half-power bandwidth',
          completed: false,
        },
      ],
    },
    {
      day: 'Day 5 - Friday',
      date: 'Fri',
      focusTheme: 'Algorithms Mock Exam & Synthesis',
      timeBlocks: [
        {
          id: 'b-5-1',
          time: '09:00 - 11:30',
          subject: 'Computer Science',
          topic: 'Timed Algorithms Mock Exam (90 min)',
          activity: 'Simulated exam conditions on Graphs, Greedy, and DP',
          durationMinutes: 150,
          priority: 'high',
          studyTechnique: 'Mock Exam',
          checkpointGoal: 'Score > 85% with written asymptotic runtimes',
          completed: false,
        },
        {
          id: 'b-5-2',
          time: '14:00 - 15:30',
          subject: 'Computer Science',
          topic: 'Mock Exam Post-Mortem & Error Analysis',
          activity: 'Root cause breakdown of any missed problems',
          durationMinutes: 90,
          priority: 'high',
          studyTechnique: 'Error Journaling',
          checkpointGoal: 'Re-solve all missed questions from scratch',
          completed: false,
        },
      ],
    },
    {
      day: 'Day 6 - Saturday',
      date: 'Sat',
      focusTheme: 'Physics Synthesis & Lab Report Review',
      timeBlocks: [
        {
          id: 'b-6-1',
          time: '10:00 - 12:00',
          subject: 'Physics',
          topic: 'Electromagnetic Waves & Poynting Vector',
          activity: 'Wave equation derivation from Maxwell equations',
          durationMinutes: 120,
          priority: 'medium',
          studyTechnique: 'Feynman Technique',
          checkpointGoal: 'Derive speed of light in vacuum from epsilon_0 and mu_0',
          completed: false,
        },
      ],
    },
    {
      day: 'Day 7 - Sunday',
      date: 'Sun',
      focusTheme: 'Spaced Review & Next Week Planning',
      timeBlocks: [
        {
          id: 'b-7-1',
          time: '11:00 - 12:30',
          subject: 'General',
          topic: 'Full Deck Spaced Repetition Mastery',
          activity: 'Review 50 flashcards across all 3 subjects',
          durationMinutes: 90,
          priority: 'medium',
          studyTechnique: 'Spaced Repetition',
          checkpointGoal: 'Zero overdue cards going into exam week',
          completed: false,
        },
      ],
    },
  ],
};

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Solve Stokes Theorem Practice Set #5 (Problems 1-8)',
    subject: 'Mathematics',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    estimatedMinutes: 90,
    completed: true,
    description: 'Focus on verifying curl F dot n dS equals line integral of F dot dr on non-planar surfaces.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Implement Left-Right Rotation helper in Red-Black Tree',
    subject: 'Computer Science',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    estimatedMinutes: 60,
    completed: false,
    description: 'Ensure parent pointers and child null-checks are strictly maintained in O(1) time.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Read Physics Ch. 29: Lenz Law and Eddy Currents',
    subject: 'Physics',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    estimatedMinutes: 45,
    completed: false,
    description: 'Take Cornell notes on magnetic braking applications and induced electric fields.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Complete Van \'t Hoff Equation derivations worksheet',
    subject: 'Chemistry',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    estimatedMinutes: 50,
    completed: false,
    description: 'Relate temperature dependence of equilibrium constants to standard enthalpy.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Review 25 Flashcards in Data Structures deck',
    subject: 'Computer Science',
    priority: 'low',
    dueDate: new Date().toISOString().split('T')[0],
    estimatedMinutes: 20,
    completed: true,
    description: 'Spaced repetition daily queue.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-6',
    title: 'Prepare cheat sheet summary sheet for Multivariable Calc Midterm',
    subject: 'Mathematics',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
    estimatedMinutes: 75,
    completed: false,
    description: 'Include Jacobians for cylindrical/spherical transforms and Green/Stokes/Gauss formulas.',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_EXAMS: UpcomingExam[] = [
  {
    id: 'exam-1',
    title: 'Multivariable Calculus Midterm II',
    subject: 'Mathematics',
    date: new Date(Date.now() + 86400000 * 8).toISOString().split('T')[0],
    daysRemaining: 8,
    priority: 'high',
    targetGrade: 'A (94%)',
    notes: 'Covers double/triple integrals, vector fields, div, curl, line integrals & Stokes theorem.',
  },
  {
    id: 'exam-2',
    title: 'Data Structures & Algorithms Midterm',
    subject: 'Computer Science',
    date: new Date(Date.now() + 86400000 * 13).toISOString().split('T')[0],
    daysRemaining: 13,
    priority: 'high',
    targetGrade: 'A+ (98%)',
    notes: 'Self-balancing trees (AVL & Red-Black), Heaps, Disjoint Sets, Graph Traversals, and DP.',
  },
  {
    id: 'exam-3',
    title: 'Physics II: Electromagnetism Quiz 4',
    subject: 'Physics',
    date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    daysRemaining: 5,
    priority: 'medium',
    targetGrade: 'A (92%)',
    notes: 'Faraday’s Law, Lenz’s Law, Inductance, and LR/LC circuits.',
  },
];

const DEFAULT_NOTES: StudyNote[] = [
  {
    id: 'note-1',
    title: "Stokes' Theorem & Surface Integrals Master Guide",
    subject: 'Mathematics',
    content: `Stokes' Theorem relates a surface integral of the curl of a vector field over a surface S to a line integral of the vector field over the boundary curve C of S.

Theorem Statement:
∮_C F · dr = ∬_S (∇ × F) · dS

Where:
1. S is an oriented piecewise-smooth surface.
2. C is the closed, piecewise-smooth boundary curve of S with positive orientation (right-hand rule).
3. F is a vector field with continuous partial derivatives on an open region containing S.

Intuition:
If you place tiny paddle wheels across the entire surface, internal swirls cancel out along internal seams. Only the paddle wheels along the perimeter boundary curve produce a net uncancelled circulation!

Key Applications:
- Calculating circulation without performing difficult surface parameterization.
- Verifying conservative vector fields (if curl F = 0 on a simply connected domain, circulation around any closed loop is zero).
- Surface independence: Any two surfaces sharing the same boundary curve C yield the exact same flux of curl F!`,
    summary: "Stokes' Theorem equates the boundary circulation of a vector field along curve C to the total flux of curl F across any spanning surface S. Interior microscopic circulations cancel out, leaving only net boundary flow.",
    keyTakeaways: [
      '∮_C F · dr = ∬_S (∇ × F) · dS',
      'The boundary curve orientation must strictly follow the right-hand rule with respect to surface normal vector n.',
      'Surface Independence: The surface integral of (curl F) depends solely on the boundary curve C, not the surface geometry.',
      'If curl F = 0, the circulation around any closed boundary is 0.',
    ],
    activeRecallQuestions: [
      'What is the physical interpretation of microscopic curl cancellation on internal surface boundaries?',
      'If two different open surfaces have the identical closed boundary curve, will their surface integrals of (curl F) be equal? Why?',
      'How do you determine whether a boundary curve C has positive or negative orientation?',
    ],
    memoryAids: [
      'Right-Hand Thumb Rule: Point thumb along normal n; fingers curl along positive direction of C.',
      'Stokes = Surface-to-Curve boundary reduction.',
    ],
    tags: ['Calculus', 'Vector Analysis', 'Stokes', 'Exams'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note-2',
    title: 'Red-Black Trees: Five Core Invariants & Rotations',
    subject: 'Computer Science',
    content: `A Red-Black Tree is a self-balancing binary search tree where every node contains a color bit (Red or Black). It guarantees O(log n) worst-case time for search, insertion, and deletion.

The 5 Invariants:
1. Node Color: Every node is either RED or BLACK.
2. Root Property: The root is always BLACK.
3. Leaf Property: Every leaf (NIL sentinel node) is BLACK.
4. Red Property: If a node is RED, both of its children must be BLACK (no two consecutive red nodes on any path).
5. Black-Height Property: For each node, all simple paths from the node to descendant leaves contain the same number of black nodes.

Height Bound:
A Red-Black tree with n internal nodes has height h ≤ 2 * log2(n + 1).

Insertion Procedure:
1. Insert new node z as in standard BST and color it RED.
2. If z is root, recolor to BLACK.
3. If parent(z) is BLACK, no violation!
4. If parent(z) is RED, check uncle(z):
   - Case 1: Uncle is RED -> Recolor parent, uncle to BLACK; grandparent to RED; recurse on grandparent.
   - Case 2: Uncle is BLACK (triangle configuration) -> Rotate parent to form line.
   - Case 3: Uncle is BLACK (line configuration) -> Rotate grandparent & swap colors of parent and grandparent.`,
    summary: 'Red-Black Trees maintain balance through 5 rigid color invariants, bounding height to 2 log(n + 1). Insertion fixups require at most 2 rotations by classifying uncle color and triangle/line geometry.',
    keyTakeaways: [
      'No two consecutive RED nodes allowed on any root-to-leaf path.',
      'Every root-to-leaf path has identical Black Height.',
      'Uncle RED: Recolor parent, uncle, and grandparent.',
      'Uncle BLACK: Perform 1 or 2 rotations and recolor.',
      'Rotations take O(1) pointer updates; overall insert takes O(log n).',
    ],
    activeRecallQuestions: [
      'Why does the black-height invariant prevent the longest path from being more than twice the shortest path?',
      'What are the 3 distinct cases when fixing a red-red violation after insertion?',
      'How many rotations can occur in the worst case during an insertion fixup?',
    ],
    memoryAids: [
      'R-B-B-R-B mnemonic: Red/Black, Root-Black, Black-Leaves, Red-No-Twin, Black-Height-Equal.',
      'Uncle Red = Recolor; Uncle Black = Rotate!',
    ],
    tags: ['Data Structures', 'Trees', 'Algorithms', 'Interview'],
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    front: "What is Stokes' Theorem in mathematical vector calculus form?",
    back: "∮_C F · dr = ∬_S (∇ × F) · dS\n(Circulation of F around closed boundary C equals flux of curl F across surface S).",
    hint: 'Relates line integral around boundary to surface integral of curl.',
    category: 'Vector Calculus',
    subject: 'Mathematics',
    intervalDays: 3,
    repetitions: 2,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    state: 'review',
  },
  {
    id: 'fc-2',
    front: 'What is the Red-Black Tree Red Property invariant?',
    back: 'If a node is RED, then both of its children must be BLACK. (No two consecutive RED nodes may exist on any path).',
    hint: 'Think about consecutive colored nodes.',
    category: 'Trees',
    subject: 'Computer Science',
    intervalDays: 4,
    repetitions: 3,
    easeFactor: 2.6,
    nextReviewDate: new Date().toISOString(),
    state: 'mastered',
  },
  {
    id: 'fc-3',
    front: 'What is Faraday’s Law of Electromagnetic Induction?',
    back: 'Induced EMF (ℰ) = - dΦ_B / dt\n(The induced electromotive force in any closed circuit is equal to the negative rate of change of magnetic flux through the circuit).',
    hint: 'Lenz’s law provides the minus sign.',
    category: 'Electromagnetism',
    subject: 'Physics',
    intervalDays: 1,
    repetitions: 1,
    easeFactor: 2.4,
    nextReviewDate: new Date().toISOString(),
    state: 'learning',
  },
  {
    id: 'fc-4',
    front: 'When fixing an insertion violation in a Red-Black tree, what action is taken if the uncle node is RED?',
    back: 'Recolor parent and uncle to BLACK, recolor grandparent to RED, then propagate the check up to the grandparent.',
    hint: 'No rotation is needed when the uncle is red.',
    category: 'Trees',
    subject: 'Computer Science',
    intervalDays: 2,
    repetitions: 2,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    state: 'learning',
  },
  {
    id: 'fc-5',
    front: 'What does the Divergence Theorem (Gauss’s Theorem) state?',
    back: '∯_S F · dS = ∭_V (∇ · F) dV\n(Total outward flux through a closed surface S equals volume integral of divergence over region V).',
    hint: 'Converts 2D surface flux to 3D volume divergence.',
    category: 'Vector Calculus',
    subject: 'Mathematics',
    intervalDays: 5,
    repetitions: 4,
    easeFactor: 2.7,
    nextReviewDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    state: 'mastered',
  },
  {
    id: 'fc-6',
    front: 'What is Lenz’s Law in qualitative terms?',
    back: 'The direction of an induced current is always such that its magnetic field opposes the change in magnetic flux that produced it.',
    hint: 'Nature abhors a change in flux.',
    category: 'Electromagnetism',
    subject: 'Physics',
    intervalDays: 1,
    repetitions: 1,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
    state: 'new',
  },
];

const DEFAULT_QUIZZES: Quiz[] = [
  {
    id: 'quiz-seed-1',
    title: 'Vector Calculus & Stokes Theorem Practice',
    subject: 'Mathematics',
    topic: 'Stokes Theorem & Curl',
    difficulty: 'medium',
    totalQuestions: 4,
    score: 4,
    completed: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        question: "In Stokes' Theorem, how is the positive orientation of the boundary curve C determined with respect to surface normal vector n?",
        options: [
          'Using the left-hand rule pointing towards the origin',
          'Using the right-hand rule where thumb points along n and curled fingers indicate circulation',
          'Orientation is independent of normal n',
          'Always in the clockwise direction in the xy-plane',
        ],
        correctAnswerIndex: 1,
        userSelectedIndex: 1,
        explanation: 'By convention, positive orientation obeys the right-hand rule: when your thumb points along the surface normal vector n, your fingers curl in the positive traversal direction of C.',
        hint: 'Think of standard cross-product and circulation conventions.',
      },
      {
        id: 'q2',
        type: 'true_false',
        question: 'True or False: If a vector field F has curl F = 0 everywhere, then its line integral around any smooth closed curve is zero.',
        options: ['True', 'False'],
        correctAnswerIndex: 0,
        userSelectedIndex: 0,
        explanation: 'True. By Stokes’ Theorem, ∮_C F · dr = ∬_S (∇ × F) · dS. If ∇ × F = 0 everywhere on the spanning surface, the integral is 0.',
        hint: 'Apply Stokes Theorem directly when curl is zero.',
      },
      {
        id: 'q3',
        type: 'mcq',
        question: 'What is the maximum number of rotations needed during an insertion fixup in a Red-Black Tree?',
        options: ['1 rotation', '2 rotations', 'O(log n) rotations', '3 rotations'],
        correctAnswerIndex: 1,
        userSelectedIndex: 1,
        explanation: 'At most 2 tree rotations are needed (one to transform a triangle into a line, and one to balance the line). While recoloring can propagate up O(log n) levels, rotations terminate after at most 2.',
        hint: 'Contrast rotation count with recoloring propagation.',
      },
      {
        id: 'q4',
        type: 'mcq',
        question: 'Faraday’s law specifies that induced electromotive force depends on what quantity?',
        options: [
          'The absolute magnitude of magnetic field B only',
          'The time rate of change of magnetic flux (dΦ_B / dt)',
          'The electrical resistance of the magnet',
          'The electrostatic potential difference at infinity',
        ],
        correctAnswerIndex: 1,
        userSelectedIndex: 1,
        explanation: 'Faraday’s law states ℰ = - dΦ_B / dt, which explicitly depends on the rate of change of magnetic flux over time, not static field magnitude.',
        hint: 'Change over time is the key trigger.',
      },
    ],
  },
];

// Historical focus logs for charts (last 7 days)
const DEFAULT_SESSIONS: FocusSessionRecord[] = [
  { id: 's-1', date: getDateOffset(-6), durationMinutes: 135, subject: 'Mathematics', mode: 'focus', completedAt: '2026-10-08T10:30:00Z' },
  { id: 's-2', date: getDateOffset(-5), durationMinutes: 180, subject: 'Computer Science', mode: 'focus', completedAt: '2026-10-09T14:00:00Z' },
  { id: 's-3', date: getDateOffset(-4), durationMinutes: 210, subject: 'Physics', mode: 'focus', completedAt: '2026-10-10T16:30:00Z' },
  { id: 's-4', date: getDateOffset(-3), durationMinutes: 165, subject: 'Mathematics', mode: 'focus', completedAt: '2026-10-11T11:45:00Z' },
  { id: 's-5', date: getDateOffset(-2), durationMinutes: 240, subject: 'Computer Science', mode: 'focus', completedAt: '2026-10-12T15:20:00Z' },
  { id: 's-6', date: getDateOffset(-1), durationMinutes: 225, subject: 'Chemistry', mode: 'focus', completedAt: '2026-10-13T17:00:00Z' },
  { id: 's-7', date: getDateOffset(0), durationMinutes: 125, subject: 'Mathematics', mode: 'focus', completedAt: new Date().toISOString() },
];

function getDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

// Storage Manager Service
export const storageService = {
  getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },

  saveUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getPlan(): StudyPlan {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAN);
      return data ? JSON.parse(data) : DEFAULT_PLAN;
    } catch {
      return DEFAULT_PLAN;
    }
  },

  savePlan(plan: StudyPlan): void {
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(plan));
  },

  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  },

  saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  getExams(): UpcomingExam[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXAMS);
      return data ? JSON.parse(data) : DEFAULT_EXAMS;
    } catch {
      return DEFAULT_EXAMS;
    }
  },

  saveExams(exams: UpcomingExam[]): void {
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
  },

  getNotes(): StudyNote[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? JSON.parse(data) : DEFAULT_NOTES;
    } catch {
      return DEFAULT_NOTES;
    }
  },

  saveNotes(notes: StudyNote[]): void {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  getFlashcards(): Flashcard[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CARDS);
      return data ? JSON.parse(data) : DEFAULT_FLASHCARDS;
    } catch {
      return DEFAULT_FLASHCARDS;
    }
  },

  saveFlashcards(cards: Flashcard[]): void {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
  },

  getQuizzes(): Quiz[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZZES);
      return data ? JSON.parse(data) : DEFAULT_QUIZZES;
    } catch {
      return DEFAULT_QUIZZES;
    }
  },

  saveQuizzes(quizzes: Quiz[]): void {
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
  },

  getSessions(): FocusSessionRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : DEFAULT_SESSIONS;
    } catch {
      return DEFAULT_SESSIONS;
    }
  },

  saveSessions(sessions: FocusSessionRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  },

  logCompletedSession(durationMinutes: number, subject: string, mode: 'focus' | 'short_break' | 'long_break'): FocusSessionRecord {
    const today = new Date().toISOString().split('T')[0];
    const newRecord: FocusSessionRecord = {
      id: `session-${Date.now()}`,
      date: today,
      durationMinutes,
      subject: subject || 'General',
      mode,
      completedAt: new Date().toISOString(),
    };

    const currentSessions = this.getSessions();
    const updatedSessions = [newRecord, ...currentSessions];
    this.saveSessions(updatedSessions);

    // Also update user profile stats if mode is focus
    if (mode === 'focus') {
      const user = this.getUser();
      user.totalStudyMinutes += durationMinutes;
      this.saveUser(user);
    }

    return newRecord;
  },

  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
    localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(DEFAULT_PLAN));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
    localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(DEFAULT_EXAMS));
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(DEFAULT_NOTES));
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(DEFAULT_FLASHCARDS));
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(DEFAULT_QUIZZES));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(DEFAULT_SESSIONS));
  },
};
