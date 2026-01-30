import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  Trophy, 
  Star, 
  Target, 
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  Clock,
  School,
  Edit
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast, Toaster } from "sonner";
import { dentalClasses, getClassesByYear } from '../utils/dentalClasses';

// Mock detailed student data
const getStudentDetails = (student) => ({
  ...student,
  gameStats: {
    totalGamesPlayed: 156,
    gamesWon: 134,
    winRate: 86,
    streakCurrent: 12,
    streakBest: 23,
    timeSpent: "45h 32m",
    achievements: [
      { id: 1, name: "Math Master", description: "Complete 50 math problems", unlocked: true, date: "2024-08-15" },
      { id: 2, name: "Speed Runner", description: "Complete 10 games in under 2 minutes", unlocked: true, date: "2024-08-20" },
      { id: 3, name: "Perfect Score", description: "Get 100% on 5 consecutive games", unlocked: false, progress: 3 },
      { id: 4, name: "Knowledge Seeker", description: "Play games for 50 hours", unlocked: true, date: "2024-09-01" },
      { id: 5, name: "Consistency Champion", description: "Play every day for 30 days", unlocked: false, progress: 18 }
    ]
  },
  recentGrades: [
    { subject: "Math", assignment: "Algebra Quiz 1", score: 95, date: "2024-08-28", maxScore: 100 },
    { subject: "Science", assignment: "Chemistry Lab", score: 88, date: "2024-08-25", maxScore: 100 },
    { subject: "Math", assignment: "Geometry Test", score: 92, date: "2024-08-22", maxScore: 100 },
    { subject: "English", assignment: "Essay Writing", score: 85, date: "2024-08-20", maxScore: 100 },
    { subject: "Science", assignment: "Physics Problems", score: 90, date: "2024-08-18", maxScore: 100 }
  ],
  skillProgress: [
    { skill: "Problem Solving", level: 8, progress: 75, maxLevel: 10 },
    { skill: "Critical Thinking", level: 7, progress: 60, maxLevel: 10 },
    { skill: "Mathematical Reasoning", level: 9, progress: 90, maxLevel: 10 },
    { skill: "Scientific Method", level: 6, progress: 45, maxLevel: 10 },
    { skill: "Communication", level: 7, progress: 70, maxLevel: 10 }
  ]
});

export function StudentProfile({ student, onBack, classes, onUpdateStudentClass }) {
  const [studentDetails] = useState(getStudentDetails(student));
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [selectedClass, setSelectedClass] = useState(student.classId);
  const classesByYear = getClassesByYear();

  const getGradeColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSkillColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleClassUpdate = () => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }
    
    const newClass = dentalClasses.find(c => c.id === selectedClass);
    if (newClass) {
      onUpdateStudentClass(student.id, selectedClass, newClass.name);
      setIsEditingClass(false);
      toast.success(`Student assigned to ${newClass.name}`);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button onClick={onBack} variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students
        </Button>
        
        <div className="flex items-start gap-6">
          <Avatar className="w-20 h-20">
            <AvatarImage src={studentDetails.avatarUrl} />
            <AvatarFallback className="text-lg">{studentDetails.avatar}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{studentDetails.name}</h1>
            <p className="text-muted-foreground mb-4">{studentDetails.email}</p>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>Level {studentDetails.currentLevel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-500" />
                <span>{studentDetails.totalPoints} Points</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" />
                <span>{studentDetails.gameProgress}% Complete</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {studentDetails.subjects.map((subject, index) => (
                <Badge key={index} variant="secondary">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Class Assignment Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="w-4 h-4 text-blue-500" />
                <span>Class Assignment</span>
              </div>
              {!isEditingClass && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingClass(true)}
                  className="h-8"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Change Class
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditingClass ? (
              <div className="space-y-3">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {Object.entries(classesByYear).map(([year, yearClasses]) => (
                      <React.Fragment key={year}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                          {year}
                        </div>
                        {yearClasses.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id}>
                            {classItem.subject}
                          </SelectItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button
                    onClick={handleClassUpdate}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0"
                    size="sm"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingClass(false);
                      setSelectedClass(student.classId);
                    }}
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{studentDetails.className}</p>
                  <p className="text-xs text-muted-foreground">Current Class</p>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                  Enrolled
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="game-progress">Game Progress</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-blue-500 rounded-full">
                    <BookOpen className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-blue-700">Games Played</span>
                </div>
                <p className="text-2xl font-bold text-blue-800">{studentDetails.gameStats.totalGamesPlayed}</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-100 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-green-500 rounded-full">
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-green-700">Win Rate</span>
                </div>
                <p className="text-2xl font-bold text-green-800">{studentDetails.gameStats.winRate}%</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-purple-500 rounded-full">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-purple-700">Current Streak</span>
                </div>
                <p className="text-2xl font-bold text-purple-800">{studentDetails.gameStats.streakCurrent}</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-orange-500 rounded-full">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-orange-700">Time Spent</span>
                </div>
                <p className="text-2xl font-bold text-orange-800">{studentDetails.gameStats.timeSpent}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Skill Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentDetails.skillProgress.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Level {skill.level}/{skill.maxLevel}
                      </span>
                      <span className="text-sm font-medium">{skill.progress}%</span>
                    </div>
                  </div>
                  <Progress value={skill.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="game-progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Course Completion</span>
                    <span className="font-medium">{studentDetails.gameProgress}%</span>
                  </div>
                  <Progress value={studentDetails.gameProgress} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{studentDetails.gameStats.gamesWon}</p>
                    <p className="text-sm text-muted-foreground">Games Won</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{studentDetails.gameStats.streakBest}</p>
                    <p className="text-sm text-muted-foreground">Best Streak</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentDetails.recentGrades.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{grade.assignment}</p>
                      <p className="text-sm text-muted-foreground">{grade.subject}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getGradeColor(grade.score)}`}>
                        {grade.score}/{grade.maxScore}
                      </p>
                      <p className="text-xs text-muted-foreground">{grade.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentDetails.gameStats.achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 border-0 rounded-xl shadow-md ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-green-50 to-emerald-100 ring-2 ring-green-200' 
                        : 'bg-gradient-to-br from-gray-50 to-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full shadow-sm ${
                        achievement.unlocked 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                      }`}>
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {achievement.description}
                        </p>
                        {achievement.unlocked ? (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-sm">
                              ✨ Unlocked
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {achievement.date}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress}/5</span>
                            </div>
                            <Progress value={(achievement.progress / 5) * 100} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}