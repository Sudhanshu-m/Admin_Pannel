import { Hono } from "hono";
import { cors } from "hono/middleware/cors";
import * as kv from "./kv_store.tsx";
import { createClient } from "@supabase/supabase-js";

declare const Deno: any;

const app = new Hono();

// Custom logger middleware
app.use('*', async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`);
  await next();
});

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client for auth
const getSupabaseClient = (serviceRole = false) => {
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    serviceRole ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '' : Deno.env.get('SUPABASE_ANON_KEY') || ''
  );
};

// Health check endpoint
app.get("/make-server-2fad19e1/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-2fad19e1/signup", async (c) => {
  try {
    const { name, email, password, department, qualification } = await c.req.json();

    if (!name || !email || !password || !department) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const supabase = getSupabaseClient(true);

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server isn't configured
      user_metadata: { name, department, qualification, role: 'teacher' }
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store teacher profile in KV store
    await kv.set(`teacher:${data.user.id}`, {
      id: data.user.id,
      name,
      email,
      department,
      qualification,
      role: 'teacher',
      createdAt: new Date().toISOString()
    });

    // Initialize empty data structures for the teacher
    await kv.set(`classes:${data.user.id}`, []);
    await kv.set(`tasks:${data.user.id}`, []);
    await kv.set(`teacher_students:${data.user.id}`, []); // New: Store student-class assignments

    return c.json({
      user: {
        id: data.user.id,
        name,
        email,
        department,
        qualification,
        role: 'teacher'
      }
    });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Signup failed: ' + error.message }, 500);
  }
});

// Get teacher profile
app.get("/make-server-2fad19e1/teacher/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const teacher = await kv.get(`teacher:${user.id}`);
    if (!teacher) {
      return c.json({ error: 'Teacher profile not found' }, 404);
    }

    return c.json({ teacher });
  } catch (error) {
    console.log('Get teacher profile error:', error);
    return c.json({ error: 'Failed to get profile: ' + error.message }, 500);
  }
});

// Update teacher profile
app.post("/make-server-2fad19e1/teacher/profile/update", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      console.log('Profile update error: No access token');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.log('Profile update auth error:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profileData = await c.req.json();
    console.log('Updating profile for teacher:', user.email, 'with data:', profileData);

    // Get current teacher profile
    const currentProfile = await kv.get(`teacher:${user.id}`) || {};

    // Update profile data
    const updatedProfile = {
      ...currentProfile,
      ...profileData,
      id: user.id,
      email: user.email,
      role: 'teacher',
      updatedAt: new Date().toISOString()
    };

    // Save updated profile
    await kv.set(`teacher:${user.id}`, updatedProfile);
    console.log('Profile updated successfully for teacher:', user.email);

    return c.json({
      success: true,
      profile: updatedProfile
    });
  } catch (error) {
    console.log('Update teacher profile error:', error);
    return c.json({ error: 'Failed to update profile: ' + error.message }, 500);
  }
});

// Get all data for a teacher (students, classes, tasks)
app.get("/make-server-2fad19e1/teacher/data", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const students = await kv.get(`students:${user.id}`) || [];
    const classes = await kv.get(`classes:${user.id}`) || [];
    const tasks = await kv.get(`tasks:${user.id}`) || [];

    return c.json({ students, classes, tasks });
  } catch (error) {
    console.log('Get data error:', error);
    return c.json({ error: 'Failed to get data: ' + error.message }, 500);
  }
});

// Save students
app.post("/make-server-2fad19e1/teacher/students", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { students } = await c.req.json();
    await kv.set(`students:${user.id}`, students);

    return c.json({ success: true });
  } catch (error) {
    console.log('Save students error:', error);
    return c.json({ error: 'Failed to save students: ' + error.message }, 500);
  }
});

// Save grades and create notifications
app.post("/make-server-2fad19e1/teacher/grades", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { grades } = await c.req.json();
    
    // Save grades in a teacher-specific key
    await kv.set(`dental_college_grades:${user.id}`, grades);

    // Create notifications for students when new grades are added
    for (const grade of grades) {
      if (grade.studentEmail) {
        // Get student's notifications
        const notificationsKey = `notifications:${grade.studentEmail}`;
        const notifications = await kv.get(notificationsKey) || [];
        
        // Check if notification for this grade already exists
        const existingNotif = notifications.find(n => n.gradeId === grade.id);
        
        if (!existingNotif) {
          // Calculate EXP earned
          const expEarned = Math.floor((grade.score / grade.maxScore) * 100);
          
          notifications.push({
            id: `notif-${Date.now()}-${Math.random()}`,
            type: 'grade',
            title: 'New Grade Posted',
            message: `You received ${grade.score}/${grade.maxScore} (${((grade.score / grade.maxScore) * 100).toFixed(0)}%) on ${grade.assignment}. +${expEarned} EXP!`,
            createdAt: new Date().toISOString(),
            read: false,
            gradeId: grade.id
          });
          
          await kv.set(notificationsKey, notifications);
        }
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Save grades error:', error);
    return c.json({ error: 'Failed to save grades: ' + error.message }, 500);
  }
});

// Save classes
app.post("/make-server-2fad19e1/teacher/classes", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { classes } = await c.req.json();
    await kv.set(`classes:${user.id}`, classes);

    return c.json({ success: true });
  } catch (error) {
    console.log('Save classes error:', error);
    return c.json({ error: 'Failed to save classes: ' + error.message }, 500);
  }
});

// Save tasks
app.post("/make-server-2fad19e1/teacher/tasks", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { tasks } = await c.req.json();
    await kv.set(`tasks:${user.id}`, tasks);

    console.log('=== TASK DISTRIBUTION DEBUG ===');
    console.log('Saving tasks:', tasks.length);
    console.log('Teacher ID:', user.id);

    // Create notifications for students when tasks are added
    for (const task of tasks) {
      console.log('\n--- Processing task:', task.title);
      console.log('Task classId:', task.classId);
      console.log('Task ID:', task.id);
      
      // Get students assigned to this teacher
      const teacherStudents = await kv.get(`teacher_students:${user.id}`) || [];
      console.log('Total teacher student assignments:', teacherStudents.length);
      console.log('All assignments:', JSON.stringify(teacherStudents, null, 2));
      
      // Get manually added students (legacy support)
      const manualStudents = await kv.get(`students:${user.id}`) || [];
      console.log('Total manual students:', manualStudents.length);
      
      // Find students in this task's class from both sources
      const assignedClassStudents = teacherStudents.filter(ts => ts.classId === task.classId);
      const manualClassStudents = manualStudents.filter(s => s.classId === task.classId);
      
      console.log('Assigned students in this class:', assignedClassStudents.length);
      console.log('Assigned students details:', JSON.stringify(assignedClassStudents, null, 2));
      console.log('Manual students in this class:', manualClassStudents.length);

      // Handle assigned (registered) students
      for (const assignment of assignedClassStudents) {
        const studentEmail = assignment.studentEmail;
        
        // Get or create student's task list
        const studentTasksKey = `student_tasks:${studentEmail}`;
        const studentTasks = await kv.get(studentTasksKey) || [];
        
        // Add task if it doesn't exist
        if (!studentTasks.find(t => t.id === task.id)) {
          studentTasks.push({
            ...task,
            completed: false,
            teacherId: user.id
          });
          await kv.set(studentTasksKey, studentTasks);
          console.log('Added task to student:', studentEmail);

          // Create notification for student
          const notificationsKey = `notifications:${studentEmail}`;
          const notifications = await kv.get(notificationsKey) || [];
          notifications.push({
            id: `notif-${Date.now()}-${Math.random()}`,
            type: 'task',
            title: 'New Assignment',
            message: `You have been assigned: ${task.title}`,
            createdAt: new Date().toISOString(),
            read: false,
            taskId: task.id
          });
          await kv.set(notificationsKey, notifications);
          console.log('Created notification for student:', studentEmail);
        }
      }

      // Handle manually added students (legacy support)
      for (const student of manualClassStudents) {
        const studentTasksKey = `student_tasks:${student.email}`;
        const studentTasks = await kv.get(studentTasksKey) || [];
        
        if (!studentTasks.find(t => t.id === task.id)) {
          studentTasks.push({
            ...task,
            completed: false,
            teacherId: user.id
          });
          await kv.set(studentTasksKey, studentTasks);

          const notificationsKey = `notifications:${student.email}`;
          const notifications = await kv.get(notificationsKey) || [];
          notifications.push({
            id: `notif-${Date.now()}-${Math.random()}`,
            type: 'task',
            title: 'New Assignment',
            message: `You have been assigned: ${task.title}`,
            createdAt: new Date().toISOString(),
            read: false,
            taskId: task.id
          });
          await kv.set(notificationsKey, notifications);
        }
      }
    }

    console.log('Tasks saved successfully');
    return c.json({ success: true });
  } catch (error) {
    console.log('Save tasks error:', error);
    return c.json({ error: 'Failed to save tasks: ' + error.message }, 500);
  }
});

// Student signup endpoint
app.post("/make-server-2fad19e1/student/signup", async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    console.log('Student signup attempt:', { name, email });

    if (!name || !email || !password) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const supabase = getSupabaseClient(true);

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server isn't configured
      user_metadata: { name, role: 'student' }
    });

    if (error) {
      console.log('Student signup auth error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log('Student auth created, user ID:', data.user.id);

    // Store student profile in KV store
    const studentProfile = {
      id: data.user.id,
      name,
      email,
      role: 'student',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };
    
    await kv.set(`student:${data.user.id}`, studentProfile);
    console.log('Student profile saved to KV store with key:', `student:${data.user.id}`);

    // Initialize empty data structures for the student
    await kv.set(`student_tasks:${email}`, []);
    await kv.set(`notifications:${email}`, []);
    
    console.log('Student signup complete:', { id: data.user.id, name, email });

    return c.json({
      user: {
        id: data.user.id,
        name,
        email,
        role: 'student'
      }
    });
  } catch (error) {
    console.log('Student signup error:', error);
    return c.json({ error: 'Signup failed: ' + error.message }, 500);
  }
});

// Get student profile
app.get("/make-server-2fad19e1/student/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is a student
    const userRole = user.user_metadata?.role;
    if (userRole === 'teacher') {
      console.log('Teacher attempted to access student profile:', user.email);
      return c.json({ error: 'Access denied. Teachers cannot access the student portal.' }, 403);
    }

    const student = await kv.get(`student:${user.id}`);
    if (!student) {
      return c.json({ error: 'Student profile not found' }, 404);
    }

    return c.json({ student });
  } catch (error) {
    console.log('Get student profile error:', error);
    return c.json({ error: 'Failed to get profile: ' + error.message }, 500);
  }
});

// Get student data (grades, tasks, notifications)
app.get("/make-server-2fad19e1/student/data", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const student = await kv.get(`student:${user.id}`);
    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    console.log('Loading data for student:', student.email);

    // Get grades from all teachers
    const allGradesKeys = await kv.getByPrefix('dental_college_grades');
    let studentGrades = [];
    
    // Filter grades that match this student's email
    for (const gradesEntry of allGradesKeys) {
      if (Array.isArray(gradesEntry.value)) {
        const matchingGrades = gradesEntry.value.filter(g => 
          g.studentEmail && g.studentEmail.toLowerCase() === student.email.toLowerCase()
        );
        studentGrades = [...studentGrades, ...matchingGrades];
      }
    }

    // Get tasks and notifications
    const tasks = await kv.get(`student_tasks:${student.email}`) || [];
    const notifications = await kv.get(`notifications:${student.email}`) || [];

    // Find which class this student is assigned to (check all teachers)
    const allTeacherStudentsKeys = await kv.getByPrefix('teacher_students:');
    let assignedClass = null;
    
    for (const entry of allTeacherStudentsKeys) {
      if (Array.isArray(entry.value)) {
        const assignment = entry.value.find(ts => ts.studentEmail === student.email);
        if (assignment) {
          assignedClass = {
            classId: assignment.classId,
            className: assignment.className,
            assignedAt: assignment.assignedAt
          };
          break;
        }
      }
    }

    console.log('Student data loaded:', {
      grades: studentGrades.length,
      tasks: tasks.length,
      notifications: notifications.length,
      assignedClass: assignedClass ? assignedClass.className : 'None'
    });

    return c.json({ 
      grades: studentGrades, 
      tasks, 
      notifications,
      assignedClass
    });
  } catch (error) {
    console.log('Get student data error:', error);
    return c.json({ error: 'Failed to get data: ' + error.message }, 500);
  }
});

// Mark task as complete
app.post("/make-server-2fad19e1/student/task/:taskId/complete", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const student = await kv.get(`student:${user.id}`);
    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    const taskId = c.req.param('taskId');
    const tasks = await kv.get(`student_tasks:${student.email}`) || [];
    
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: true, completedAt: new Date().toISOString() } : task
    );

    await kv.set(`student_tasks:${student.email}`, updatedTasks);

    return c.json({ success: true });
  } catch (error) {
    console.log('Complete task error:', error);
    return c.json({ error: 'Failed to complete task: ' + error.message }, 500);
  }
});

// Mark notification as read
app.post("/make-server-2fad19e1/student/notification/:notificationId/read", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const student = await kv.get(`student:${user.id}`);
    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    const notificationId = c.req.param('notificationId');
    const notifications = await kv.get(`notifications:${student.email}`) || [];
    
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );

    await kv.set(`notifications:${student.email}`, updatedNotifications);

    return c.json({ success: true });
  } catch (error) {
    console.log('Mark notification read error:', error);
    return c.json({ error: 'Failed to mark notification as read: ' + error.message }, 500);
  }
});

// Submit quiz
app.post("/make-server-2fad19e1/student/quiz/submit", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      console.log('Quiz submission error: No access token provided');
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.log('Quiz submission auth error:', error);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const student = await kv.get(`student:${user.id}`);
    if (!student) {
      console.log('Quiz submission error: Student not found for user ID:', user.id);
      return c.json({ error: 'Student not found' }, 404);
    }

    const submission = await c.req.json();
    console.log('Quiz submission received from student:', student.email, 'Quiz ID:', submission.quizId);

    // Get student's tasks to find the quiz and mark it as complete
    const tasks = await kv.get(`student_tasks:${student.email}`) || [];
    const quiz = tasks.find(t => t.id === submission.quizId);
    
    if (!quiz) {
      console.log('Quiz submission error: Quiz not found:', submission.quizId);
      return c.json({ error: 'Quiz not found' }, 404);
    }

    console.log('Found quiz:', quiz.title);

    // Mark quiz as completed
    const updatedTasks = tasks.map(task => 
      task.id === submission.quizId 
        ? { 
            ...task, 
            completed: true, 
            completedAt: new Date().toISOString(),
            submission: submission
          } 
        : task
    );

    await kv.set(`student_tasks:${student.email}`, updatedTasks);
    console.log('Quiz marked as completed for student:', student.email);

    // Create a grade entry for this quiz
    const gradeEntry = {
      id: `grade-${Date.now()}`,
      studentEmail: student.email,
      studentName: student.name,
      assignment: quiz.title,
      subject: quiz.subject || 'Quiz',
      score: submission.pointsEarned,
      maxScore: submission.totalPoints,
      date: new Date().toISOString(),
      feedback: `Quiz completed: ${submission.correctAnswers}/${submission.totalQuestions} correct (${submission.scorePercentage.toFixed(0)}%). Time spent: ${Math.floor(submission.timeSpent / 60)} minutes ${submission.timeSpent % 60} seconds.`,
      createdAt: new Date().toISOString()
    };

    // Find the teacher who assigned this quiz (from the task's teacher info or class info)
    // For now, we'll add it to all teachers who can see this student
    const allTeacherStudentsKeys = await kv.getByPrefix('teacher_students:');
    let teacherId = null;
    
    for (const entry of allTeacherStudentsKeys) {
      if (Array.isArray(entry.value)) {
        const assignment = entry.value.find(ts => ts.studentEmail === student.email);
        if (assignment) {
          teacherId = entry.key.replace('teacher_students:', '');
          break;
        }
      }
    }

    if (teacherId) {
      console.log('Adding quiz grade for teacher:', teacherId);
      const gradesKey = `dental_college_grades:${teacherId}`;
      const grades = await kv.get(gradesKey) || [];
      grades.push(gradeEntry);
      await kv.set(gradesKey, grades);
      console.log('Grade entry added successfully');
    } else {
      console.log('Warning: Could not find teacher for student, grade not saved to teacher records');
    }

    // Create a notification for the student
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'grade',
      title: `Quiz "${quiz.title}" Submitted!`,
      message: `You scored ${submission.pointsEarned}/${submission.totalPoints} points (${submission.scorePercentage.toFixed(0)}%)`,
      createdAt: new Date().toISOString(),
      read: false
    };

    const notifications = await kv.get(`notifications:${student.email}`) || [];
    notifications.unshift(notification);
    await kv.set(`notifications:${student.email}`, notifications);
    console.log('Notification created for quiz submission');

    return c.json({ 
      success: true,
      submission: submission,
      grade: gradeEntry
    });
  } catch (error) {
    console.log('Submit quiz error:', error);
    return c.json({ error: 'Failed to submit quiz: ' + error.message }, 500);
  }
});

// Get all registered students (for admin panel)
app.get("/make-server-2fad19e1/teacher/all-students", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get teacher's assigned students
    const teacherStudents = await kv.get(`teacher_students:${user.id}`) || [];

    // Get all registered students from student portal
    const studentKeys = await kv.getByPrefix('student:');
    console.log('DEBUG: Found student keys:', studentKeys.length);
    const registeredStudents = [];

    for (const entry of studentKeys) {
      const student = entry.value;
      
      // Skip if student data is invalid
      if (!student || !student.id || !student.name || !student.email) {
        console.log('DEBUG: Skipping invalid student entry:', entry.key, student);
        continue;
      }
      
      console.log('DEBUG: Processing student:', student.name, student.email);
      
      // Check if this student is assigned to this teacher
      const assignment = teacherStudents.find(ts => ts.studentId === student.id);
      
      // Get student's grades from all teachers
      const allGradesKeys = await kv.getByPrefix('dental_college_grades');
      let studentGrades = [];
      
      for (const gradesEntry of allGradesKeys) {
        if (Array.isArray(gradesEntry.value)) {
          const matchingGrades = gradesEntry.value.filter(g => 
            g.studentEmail && g.studentEmail.toLowerCase() === student.email.toLowerCase()
          );
          studentGrades = [...studentGrades, ...matchingGrades];
        }
      }

      // Calculate student stats
      const totalEXP = studentGrades.reduce((sum, grade) => {
        return sum + Math.floor((grade.score / grade.maxScore) * 100);
      }, 0);

      const averageGrade = studentGrades.length > 0 
        ? Math.round(studentGrades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / studentGrades.length)
        : 0;

      // Get student's tasks
      const tasks = await kv.get(`student_tasks:${student.email}`) || [];
      const completedTasks = tasks.filter(t => t.completed).length;

      // Calculate level (every 200 EXP = 1 level)
      const currentLevel = Math.floor(totalEXP / 200) + 1;
      
      // Calculate game progress (based on completed tasks and grades)
      const gameProgress = Math.min(95, Math.round((completedTasks * 10 + studentGrades.length * 5) / 2));

      registeredStudents.push({
        id: student.id,
        name: student.name,
        email: student.email,
        avatar: student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        currentLevel,
        totalPoints: totalEXP,
        gameProgress,
        lastActive: student.lastActive || 'Recently',
        status: 'active',
        subjects: [],
        averageGrade,
        classId: assignment ? assignment.classId : null,
        className: assignment ? assignment.className : 'Not assigned',
        isRegistered: true,
        isAssigned: !!assignment,
        registeredAt: student.createdAt
      });
    }

    console.log('DEBUG: Total registered students to return:', registeredStudents.length);
    return c.json({ students: registeredStudents });
  } catch (error) {
    console.log('Get all students error:', error);
    return c.json({ error: 'Failed to get students: ' + error.message }, 500);
  }
});

// Assign a registered student to a class
app.post("/make-server-2fad19e1/teacher/assign-student", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { studentId, studentEmail, classId, className } = await c.req.json();

    if (!studentId || !classId || !className) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    console.log('Assigning student:', {
      studentId,
      studentEmail,
      classId,
      className,
      teacherId: user.id
    });

    // Get teacher's student assignments
    const teacherStudents = await kv.get(`teacher_students:${user.id}`) || [];
    console.log('Current teacher students before assignment:', teacherStudents.length);

    // Check if student is already assigned
    const existingIndex = teacherStudents.findIndex(ts => ts.studentId === studentId);
    
    if (existingIndex >= 0) {
      // Update existing assignment
      teacherStudents[existingIndex] = {
        studentId,
        studentEmail,
        classId,
        className,
        assignedAt: teacherStudents[existingIndex].assignedAt,
        updatedAt: new Date().toISOString()
      };
      console.log('Updated existing assignment at index:', existingIndex);
    } else {
      // Add new assignment
      teacherStudents.push({
        studentId,
        studentEmail,
        classId,
        className,
        assignedAt: new Date().toISOString()
      });
      console.log('Added new assignment, total now:', teacherStudents.length);
    }

    await kv.set(`teacher_students:${user.id}`, teacherStudents);
    console.log('Successfully saved teacher_students with', teacherStudents.length, 'assignments');

    return c.json({ success: true });
  } catch (error) {
    console.log('Assign student error:', error);
    return c.json({ error: 'Failed to assign student: ' + error.message }, 500);
  }
});

// Unassign a student from teacher's classes
app.post("/make-server-2fad19e1/teacher/unassign-student", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { studentId } = await c.req.json();

    if (!studentId) {
      return c.json({ error: 'Missing student ID' }, 400);
    }

    // Get teacher's student assignments
    const teacherStudents = await kv.get(`teacher_students:${user.id}`) || [];

    // Remove the student assignment
    const updatedAssignments = teacherStudents.filter(ts => ts.studentId !== studentId);

    await kv.set(`teacher_students:${user.id}`, updatedAssignments);

    return c.json({ success: true });
  } catch (error) {
    console.log('Unassign student error:', error);
    return c.json({ error: 'Failed to unassign student: ' + error.message }, 500);
  }
});

// Debug endpoint to check all students in KV store
app.get("/make-server-2fad19e1/debug/students", async (c) => {
  try {
    const studentKeys = await kv.getByPrefix('student:');
    console.log('=== DEBUG: All Students in KV Store ===');
    console.log('Total student records:', studentKeys.length);
    
    const students = studentKeys.map((entry, index) => {
      console.log(`Student ${index + 1}:`, entry.key, entry.value);
      return {
        key: entry.key,
        ...entry.value
      };
    });

    return c.json({ 
      count: students.length,
      students: students 
    });
  } catch (error) {
    console.log('Debug students error:', error);
    return c.json({ error: 'Failed to get students: ' + error.message }, 500);
  }
});

// Debug endpoint to check teacher assignments
app.get("/make-server-2fad19e1/debug/teacher-students/:teacherId", async (c) => {
  try {
    const teacherId = c.req.param('teacherId');
    const teacherStudents = await kv.get(`teacher_students:${teacherId}`) || [];
    
    console.log('=== DEBUG: Teacher Student Assignments ===');
    console.log('Teacher ID:', teacherId);
    console.log('Total assignments:', teacherStudents.length);
    console.log('Assignments:', teacherStudents);

    return c.json({ 
      teacherId,
      count: teacherStudents.length,
      assignments: teacherStudents
    });
  } catch (error) {
    console.log('Debug teacher students error:', error);
    return c.json({ error: 'Failed to get teacher students: ' + error.message }, 500);
  }
});

// Debug endpoint to check student tasks and notifications
app.get("/make-server-2fad19e1/debug/student-data/:email", async (c) => {
  try {
    const email = c.req.param('email');
    const tasks = await kv.get(`student_tasks:${email}`) || [];
    const notifications = await kv.get(`notifications:${email}`) || [];
    
    console.log('=== DEBUG: Student Data ===');
    console.log('Email:', email);
    console.log('Tasks:', tasks.length);
    console.log('Notifications:', notifications.length);

    return c.json({ 
      email,
      tasks,
      notifications
    });
  } catch (error) {
    console.log('Debug student data error:', error);
    return c.json({ error: 'Failed to get student data: ' + error.message }, 500);
  }
});

// Get task/quiz statistics for teacher
app.get("/make-server-2fad19e1/teacher/task-stats", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const supabase = getSupabaseClient(true);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('=== FETCHING TASK STATISTICS ===');
    console.log('Teacher ID:', user.id);

    // Get teacher's tasks
    const tasks = await kv.get(`tasks:${user.id}`) || [];
    console.log('Total tasks:', tasks.length);

    // Get teacher's assigned students
    const teacherStudents = await kv.get(`teacher_students:${user.id}`) || [];
    console.log('Total assigned students:', teacherStudents.length);

    // Get manually added students (legacy)
    const manualStudents = await kv.get(`students:${user.id}`) || [];
    console.log('Total manual students:', manualStudents.length);

    // Calculate statistics for each task
    const taskStats = {};

    for (const task of tasks) {
      console.log('\n--- Processing task:', task.title, 'ID:', task.id);
      
      // Find all students in this task's class
      const assignedClassStudents = teacherStudents.filter(ts => ts.classId === task.classId);
      const manualClassStudents = manualStudents.filter(s => s.classId === task.classId);
      
      const totalStudents = assignedClassStudents.length + manualClassStudents.length;
      console.log('Students in class:', totalStudents, '(Assigned:', assignedClassStudents.length, 'Manual:', manualClassStudents.length, ')');

      let completed = 0;
      let attempted = 0;

      // Check assigned students
      for (const assignment of assignedClassStudents) {
        const studentEmail = assignment.studentEmail;
        const studentTasks = await kv.get(`student_tasks:${studentEmail}`) || [];
        const studentTask = studentTasks.find(t => t.id === task.id);
        
        if (studentTask) {
          attempted++;
          if (studentTask.completed) {
            completed++;
          }
        }
      }

      // Check manual students
      for (const student of manualClassStudents) {
        const studentTasks = await kv.get(`student_tasks:${student.email}`) || [];
        const studentTask = studentTasks.find(t => t.id === task.id);
        
        if (studentTask) {
          attempted++;
          if (studentTask.completed) {
            completed++;
          }
        }
      }

      console.log('Task stats - Total:', totalStudents, 'Attempted:', attempted, 'Completed:', completed);

      taskStats[task.id] = {
        totalStudents,
        completed,
        attempted,
        completionRate: totalStudents > 0 ? Math.round((completed / totalStudents) * 100) : 0,
        attemptRate: totalStudents > 0 ? Math.round((attempted / totalStudents) * 100) : 0
      };
    }

    console.log('=== TASK STATISTICS COMPLETE ===');
    return c.json({ taskStats });
  } catch (error) {
    console.log('Get task stats error:', error);
    return c.json({ error: 'Failed to get task stats: ' + error.message }, 500);
  }
});

Deno.serve(app.fetch);