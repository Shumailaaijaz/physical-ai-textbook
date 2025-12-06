import express, { Request, Response } from 'express';

const router = express.Router();

/**
 * Example API endpoint
 * This can be extended with actual API functionality
 */
router.get('/chapters', (req: Request, res: Response) => {
  res.json({
    chapters: [
      { id: 0, title: 'Preface', slug: '00-preface' },
      { id: 1, title: 'Introduction to Physical AI', slug: '01-introduction-to-physical-ai' },
      { id: 2, title: 'ROS 2 Fundamentals', slug: '02-ros2-fundamentals' },
      { id: 3, title: 'URDF & Robot Modeling', slug: '03-urdf-robot-modeling' },
      { id: 4, title: 'Gazebo Simulation', slug: '04-gazebo-simulation' },
      { id: 5, title: 'Unity Robotics Hub', slug: '05-unity-robotics-hub' },
      { id: 6, title: 'Isaac Sim Basics', slug: '06-isaac-sim-basics' },
      { id: 7, title: 'Isaac ROS Integration', slug: '07-isaac-ros-integration' },
      { id: 8, title: 'Legged Locomotion', slug: '08-legged-locomotion' },
      { id: 9, title: 'Manipulation & Grasping', slug: '09-manipulation-grasping' },
      { id: 10, title: 'Vision-Language-Action Models', slug: '10-vision-language-action' },
      { id: 11, title: 'Capstone Project', slug: '11-capstone-project' },
      { id: 12, title: 'Hardware Guide', slug: '12-hardware-guide' },
      { id: 13, title: 'Ethics & Future of Physical AI', slug: '13-ethics-future-physical-ai' },
    ],
  });
});

/**
 * Example progress tracking endpoint
 */
router.post('/progress', (req: Request, res: Response) => {
  // In production, this would save to a database
  const { chapterId, userId, completed } = req.body;

  res.json({
    success: true,
    message: 'Progress updated',
    data: { chapterId, userId, completed },
  });
});

export default router;
