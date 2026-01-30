import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  BookOpen, 
  Award, 
  TrendingUp, 
  User,
  Calendar,
  Target,
  BarChart3,
  GraduationCap,
  Plus
} from 'lucide-react';

export function ClassView({ classData, students, onBack, onAddTask, onAddQuiz }) {
  const enrolledStudents = students.filter(student => student.classId === classData.id);
  
  const averageProgress = enrolledStudents.length > 0
    ? Math.round(enrolledStudents.reduce((acc, s) => acc + s.gameProgress, 0) / enrolledStudents.length)
    : 0;
  
  const averageGrade = enrolledStudents.length > 0
    ? Math.round(enrolledStudents.reduce((acc, s) => acc + s.averageGrade, 0) / enrolledStudents.length)
    : 0;

  const activeStudents = enrolledStudents.filter(s => s.status === 'active').length;
  
  const getGradeColor = (grade) => {
    const gradeNumber = parseInt(grade);
    if (gradeNumber <= 5) return 'bg-gradient-to-r from-green-400 to-emerald-500';
    if (gradeNumber <= 8) return 'bg-gradient-to-r from-blue-400 to-blue-500';
    if (gradeNumber <= 10) return 'bg-gradient-to-r from-purple-400 to-purple-500';
    return 'bg-gradient-to-r from-orange-400 to-red-500';
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getGradeColorByScore = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Classes
        </Button>
        <div className="flex gap-3">
          <Button
            onClick={onAddQuiz}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Quiz
          </Button>
          <Button
            onClick={onAddTask}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Class Header */}
      <div className="mb-6 p-6 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-medium">{classData.name}</h1>
                <p className="text-white/90 text-sm mt-1">{classData.subject}</p>
              </div>
            </div>
            <Badge className={`${getGradeColor(classData.grade)} text-white border-0`}>
              {classData.grade}
            </Badge>
          </div>
          <div className="flex gap-4">
            <div className="text-center bg-white/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" />
                <p className="text-sm text-white/90">Enrolled</p>
              </div>
              <p className="text-2xl font-semibold">{enrolledStudents.length}/{classData.capacity}</p>
            </div>
            <div className="text-center bg-white/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" />
                <p className="text-sm text-white/90">Active</p>
              </div>
              <p className="text-2xl font-semibold">{activeStudents}</p>
            </div>
          </div>
        </div>
        
        {classData.description && (
          <p className="mt-4 text-white/90">
            {classData.description}
          </p>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Average Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold mb-2 text-blue-600">{averageProgress}%</div>
            <Progress value={averageProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="w-4 h-4 text-green-500" />
              Average Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold mb-2 text-green-600">{averageGrade}%</div>
            <Progress value={averageGrade} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" />
              Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold mb-2 text-purple-600">
              {Math.round((enrolledStudents.length / classData.capacity) * 100)}%
            </div>
            <Progress value={(enrolledStudents.length / classData.capacity) * 100} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="all">
            All Students ({enrolledStudents.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeStudents})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            Inactive ({enrolledStudents.length - activeStudents})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {enrolledStudents.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Students Enrolled</h3>
                <p className="text-muted-foreground">
                  This class doesn't have any students yet. Add students to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            enrolledStudents.map((student) => (
              <Card 
                key={student.id} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Student Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xl shadow-lg">
                        {student.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-1">{student.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{student.email}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                            {student.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {student.lastActive}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Student Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <GraduationCap className="w-4 h-4 text-purple-500" />
                          <p className="text-xs text-muted-foreground">Level</p>
                        </div>
                        <p className="text-xl font-semibold text-purple-600">{student.currentLevel}</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <p className="text-xs text-muted-foreground">Points</p>
                        </div>
                        <p className="text-xl font-semibold text-yellow-600">{student.totalPoints}</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="w-4 h-4 text-blue-500" />
                          <p className="text-xs text-muted-foreground">Progress</p>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <p className="text-xl font-semibold text-blue-600">{student.gameProgress}%</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <BarChart3 className="w-4 h-4 text-green-500" />
                          <p className="text-xs text-muted-foreground">Grade</p>
                        </div>
                        <Badge className={`${getGradeColorByScore(student.averageGrade)} text-lg px-2 py-1 border-0`}>
                          {student.averageGrade}%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Game Progress</span>
                      <span className="text-xs font-medium">{student.gameProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(student.gameProgress)} transition-all duration-500`}
                        style={{ width: `${student.gameProgress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {enrolledStudents.filter(s => s.status === 'active').length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Active Students</h3>
                <p className="text-muted-foreground">
                  There are no active students in this class.
                </p>
              </CardContent>
            </Card>
          ) : (
            enrolledStudents.filter(s => s.status === 'active').map((student) => (
              <Card 
                key={student.id} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xl shadow-lg">
                        {student.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-1">{student.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{student.email}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="default">🟢 Active</Badge>
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {student.lastActive}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <GraduationCap className="w-4 h-4 text-purple-500" />
                          <p className="text-xs text-muted-foreground">Level</p>
                        </div>
                        <p className="text-xl font-semibold text-purple-600">{student.currentLevel}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <p className="text-xs text-muted-foreground">Points</p>
                        </div>
                        <p className="text-xl font-semibold text-yellow-600">{student.totalPoints}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="w-4 h-4 text-blue-500" />
                          <p className="text-xs text-muted-foreground">Progress</p>
                        </div>
                        <p className="text-xl font-semibold text-blue-600">{student.gameProgress}%</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <BarChart3 className="w-4 h-4 text-green-500" />
                          <p className="text-xs text-muted-foreground">Grade</p>
                        </div>
                        <Badge className={`${getGradeColorByScore(student.averageGrade)} text-lg px-2 py-1 border-0`}>
                          {student.averageGrade}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Game Progress</span>
                      <span className="text-xs font-medium">{student.gameProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(student.gameProgress)} transition-all duration-500`}
                        style={{ width: `${student.gameProgress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {enrolledStudents.filter(s => s.status === 'inactive').length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Inactive Students</h3>
                <p className="text-muted-foreground">
                  All students in this class are currently active!
                </p>
              </CardContent>
            </Card>
          ) : (
            enrolledStudents.filter(s => s.status === 'inactive').map((student) => (
              <Card 
                key={student.id} 
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-xl shadow-lg">
                        {student.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-1">{student.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{student.email}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">🔴 Inactive</Badge>
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {student.lastActive}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <GraduationCap className="w-4 h-4 text-purple-500" />
                          <p className="text-xs text-muted-foreground">Level</p>
                        </div>
                        <p className="text-xl font-semibold text-purple-600">{student.currentLevel}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <p className="text-xs text-muted-foreground">Points</p>
                        </div>
                        <p className="text-xl font-semibold text-yellow-600">{student.totalPoints}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="w-4 h-4 text-blue-500" />
                          <p className="text-xs text-muted-foreground">Progress</p>
                        </div>
                        <p className="text-xl font-semibold text-blue-600">{student.gameProgress}%</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <BarChart3 className="w-4 h-4 text-green-500" />
                          <p className="text-xs text-muted-foreground">Grade</p>
                        </div>
                        <Badge className={`${getGradeColorByScore(student.averageGrade)} text-lg px-2 py-1 border-0`}>
                          {student.averageGrade}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Game Progress</span>
                      <span className="text-xs font-medium">{student.gameProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(student.gameProgress)} transition-all duration-500`}
                        style={{ width: `${student.gameProgress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}