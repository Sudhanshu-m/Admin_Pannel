import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { TakeQuiz } from './TakeQuiz';
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  BookOpen, 
  Target, 
  Award,
  Bell,
  LogOut,
  Zap,
  BarChart3,
  ListTodo,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Flame
} from 'lucide-react';
import { toast, Toaster } from "sonner";


export function StudentDashboard({ student, onLogout, accessToken, projectId }) {
  const [grades, setGrades] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [assignedClass, setAssignedClass] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [stats, setStats] = useState({
    totalEXP: 0,
    level: 1,
    currentLevelEXP: 0,
    nextLevelEXP: 100,
    streak: 0,
    totalAssignments: 0,
    completedAssignments: 0
  });

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    try {
      // Fetch student data from backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2fad19e1/student/data`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Student data loaded:', data);
        setGrades(data.grades || []);
        setTasks(data.tasks || []);
        setNotifications(data.notifications || []);
        setAssignedClass(data.assignedClass || null);
        calculateStats(data.grades || [], data.tasks || []);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      toast.error('Failed to load data');
    }
  };

  const calculateStats = (gradesData, tasksData) => {
    // Calculate total EXP from grades
    const totalEXP = gradesData.reduce((sum, grade) => {
      // EXP = (score/maxScore) * 100
      return sum + Math.floor((grade.score / grade.maxScore) * 100);
    }, 0);

    // Calculate level (every 500 EXP = 1 level)
    const level = Math.floor(totalEXP / 500) + 1;
    const currentLevelEXP = totalEXP % 500;
    const nextLevelEXP = 500;

    // Calculate assignment stats
    const completedAssignments = tasksData.filter(t => t.completed).length;
    const totalAssignments = tasksData.length;

    // Calculate streak (dummy for now - would need more logic)
    const streak = Math.floor(totalEXP / 100);

    setStats({
      totalEXP,
      level,
      currentLevelEXP,
      nextLevelEXP,
      streak,
      totalAssignments,
      completedAssignments
    });
  };

  const markTaskComplete = async (taskId) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2fad19e1/student/task/${taskId}/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        toast.success('Task marked as complete!');
        loadStudentData();
      }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to mark task as complete');
    }
  };

  const handleQuizSubmission = async (submission) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2fad19e1/student/quiz/submit`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submission)
        }
      );

      if (response.ok) {
        toast.success('Quiz submitted successfully!');
        setSelectedQuiz(null);
        loadStudentData();
      } else {
        toast.error('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    }
  };

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2fad19e1/student/notification/${notificationId}/read`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      loadStudentData();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const getGradeBadge = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return { label: 'A', color: 'from-green-500 to-emerald-600' };
    if (percentage >= 80) return { label: 'B', color: 'from-blue-500 to-blue-600' };
    if (percentage >= 70) return { label: 'C', color: 'from-yellow-500 to-orange-500' };
    if (percentage >= 60) return { label: 'D', color: 'from-orange-500 to-red-500' };
    return { label: 'F', color: 'from-red-500 to-red-600' };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // If taking a quiz, show the quiz interface
  if (selectedQuiz) {
    return (
      <TakeQuiz
        quiz={selectedQuiz}
        onBack={() => setSelectedQuiz(null)}
        onSubmit={handleQuizSubmission}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12 border-2 border-white shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-lg">
                  {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-bold">{student.name}</h1>
                <div className="flex items-center gap-2">
                  <p className="text-white/80 text-sm">{student.email}</p>
                  {assignedClass && (
                    <>
                      <span className="text-white/60">•</span>
                      <Badge className="bg-white/20 text-white border-white/30 text-xs">
                        {assignedClass.className}
                      </Badge>
                    </>
                  )}
                  {!assignedClass && (
                    <>
                      <span className="text-white/60">•</span>
                      <span className="text-white/60 text-xs">Not assigned to any class</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 relative"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
              <Button
                onClick={onLogout}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Level Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8" />
                <span className="text-3xl font-bold">Lv. {stats.level}</span>
              </div>
              <p className="text-white/90 text-sm mb-3">Current Level</p>
              <Progress value={(stats.currentLevelEXP / stats.nextLevelEXP) * 100} className="h-2 bg-white/20" />
              <p className="text-xs text-white/80 mt-2">{stats.currentLevelEXP}/{stats.nextLevelEXP} EXP to next level</p>
            </CardContent>
          </Card>

          {/* Total EXP Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8" />
                <span className="text-3xl font-bold">{stats.totalEXP}</span>
              </div>
              <p className="text-white/90 text-sm">Total Experience</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Keep earning!</span>
              </div>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-8 h-8" />
                <span className="text-3xl font-bold">{stats.streak}</span>
              </div>
              <p className="text-white/90 text-sm">Day Streak</p>
              <div className="flex items-center gap-2 mt-2">
                <Star className="w-4 h-4" />
                <span className="text-xs">On fire!</span>
              </div>
            </CardContent>
          </Card>

          {/* Assignments Card */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-8 h-8" />
                <span className="text-3xl font-bold">{stats.completedAssignments}/{stats.totalAssignments}</span>
              </div>
              <p className="text-white/90 text-sm">Completed Tasks</p>
              <div className="flex items-center gap-2 mt-2">
                <Target className="w-4 h-4" />
                <span className="text-xs">{stats.totalAssignments - stats.completedAssignments} pending</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white shadow-md border-0 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="grades" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <BookOpen className="w-4 h-4 mr-2" />
              Grades
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <ListTodo className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              {unreadNotifications > 0 && (
                <Badge className="ml-2 bg-red-500 text-white border-0 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Grades */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    Recent Grades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {grades.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No grades yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {grades.slice(0, 10).map((grade) => {
                          const badge = getGradeBadge(grade.score, grade.maxScore);
                          const expGained = Math.floor((grade.score / grade.maxScore) * 100);
                          return (
                            <div key={grade.id} className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium">{grade.assignment}</h4>
                                  <p className="text-sm text-muted-foreground">{grade.subject}</p>
                                </div>
                                <Badge className={`bg-gradient-to-r ${badge.color} text-white border-0 shadow-sm`}>
                                  {badge.label}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {grade.score}/{grade.maxScore} ({((grade.score / grade.maxScore) * 100).toFixed(0)}%)
                                </span>
                                <div className="flex items-center gap-1 text-yellow-600 font-medium">
                                  <Zap className="w-4 h-4" />
                                  +{expGained} EXP
                                </div>
                              </div>
                              {grade.feedback && (
                                <p className="text-xs text-muted-foreground mt-2 italic">"{grade.feedback}"</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Upcoming Tasks */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Upcoming Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {tasks.filter(t => !t.completed).length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No pending tasks</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tasks.filter(t => !t.completed).map((task) => (
                          <div key={task.id} className="p-4 rounded-lg border bg-white hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium">{task.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                              </div>
                              <Badge className={`${getPriorityColor(task.priority)} border`}>
                                {task.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-3">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => markTaskComplete(task.id)}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 h-8"
                              >
                                Complete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Grades Tab */}
          <TabsContent value="grades">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  All Grades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {grades.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg mb-2">No grades yet</p>
                    <p className="text-sm">Your grades will appear here once your teacher adds them</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {grades.map((grade) => {
                      const badge = getGradeBadge(grade.score, grade.maxScore);
                      const expGained = Math.floor((grade.score / grade.maxScore) * 100);
                      return (
                        <div key={grade.id} className="p-6 rounded-xl bg-gradient-to-r from-white to-gray-50 border shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold">{grade.assignment}</h3>
                                <Badge className={`bg-gradient-to-r ${badge.color} text-white border-0 shadow-sm px-3`}>
                                  Grade: {badge.label}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <BookOpen className="w-4 h-4" />
                                  {grade.subject}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(grade.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-indigo-600 mb-1">
                                {grade.score}/{grade.maxScore}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {((grade.score / grade.maxScore) * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t">
                            {grade.feedback ? (
                              <p className="text-sm text-muted-foreground italic flex-1">
                                <span className="font-medium">Feedback:</span> "{grade.feedback}"
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">No feedback provided</p>
                            )}
                            <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200">
                              <Zap className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-semibold text-yellow-700">+{expGained} EXP</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="w-5 h-5 text-indigo-600" />
                  My Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ListTodo className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg mb-2">No tasks assigned</p>
                    <p className="text-sm">Your assignments will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <div 
                        key={task.id} 
                        className={`p-6 rounded-xl border shadow-sm hover:shadow-md transition-all ${
                          task.completed 
                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                            : 'bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </h3>
                              {task.type === 'quiz' && (
                                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Quiz - {task.duration} min
                                </Badge>
                              )}
                              <Badge className={`${getPriorityColor(task.priority)} border`}>
                                {task.priority}
                              </Badge>
                              {task.completed && (
                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {task.subject}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                {task.totalPoints || task.maxPoints} points
                              </span>
                              {task.type === 'quiz' && (
                                <span className="flex items-center gap-1">
                                  <AlertCircle className="w-4 h-4" />
                                  {task.questions?.length || 0} questions
                                </span>
                              )}
                            </div>
                          </div>
                          {!task.completed && (
                            task.type === 'quiz' ? (
                              <Button
                                onClick={() => startQuiz(task)}
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0"
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Start Quiz
                              </Button>
                            ) : (
                              <Button
                                onClick={() => markTaskComplete(task.id)}
                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Mark Complete
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Bell className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg mb-2">No notifications</p>
                    <p className="text-sm">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => !notification.read && markNotificationRead(notification.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                          notification.read 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            notification.type === 'grade' ? 'bg-green-100' :
                            notification.type === 'task' ? 'bg-blue-100' :
                            'bg-purple-100'
                          }`}>
                            {notification.type === 'grade' ? <Award className="w-4 h-4 text-green-600" /> :
                             notification.type === 'task' ? <ListTodo className="w-4 h-4 text-blue-600" /> :
                             <AlertCircle className="w-4 h-4 text-purple-600" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium mb-1">{notification.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}