import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Plus, Calendar, BookOpen } from 'lucide-react';
import { toast, Toaster } from "sonner";

export function AddTask({ classData, onBack, onAddTask }) {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    subject: classData.subject || '',
    maxPoints: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!taskData.title || !taskData.description || !taskData.dueDate || !taskData.maxPoints) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTask = {
      id: `task-${Date.now()}`,
      classId: classData.id,
      className: classData.name,
      ...taskData,
      maxPoints: parseInt(taskData.maxPoints),
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    onAddTask(newTask);
    toast.success(`Task "${taskData.title}" added to ${classData.name}`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Button
        onClick={onBack}
        variant="ghost"
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Class
      </Button>

      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Task for {classData.name}
          </CardTitle>
          <p className="text-sm text-white/90 mt-2">
            This task will be assigned to all students in this class
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Complete Oral Pathology Case Study"
                value={taskData.title}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed instructions for the task..."
                value={taskData.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                className="mt-2 min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Subject name"
                  value={taskData.subject}
                  onChange={(e) => setTaskData({ ...taskData, subject: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="maxPoints">Max Points *</Label>
                <Input
                  id="maxPoints"
                  type="number"
                  placeholder="100"
                  value={taskData.maxPoints}
                  onChange={(e) => setTaskData({ ...taskData, maxPoints: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={taskData.dueDate}
                  onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={taskData.priority}
                  onValueChange={(value) => setTaskData({ ...taskData, priority: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Task Assignment</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This task will be automatically assigned to all {classData.studentCount} student(s) currently enrolled in {classData.name}.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
