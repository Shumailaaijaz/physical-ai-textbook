import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type ModuleItem = {
  id: string;
  title: string;
  weekRange: string;
  description: string;
  learningOutcomes: string[];
  icon: string;
};

const ModuleList: ModuleItem[] = [
  {
    id: 'module-1-ros2',
    title: 'Module 1: The Robotic Nervous System (ROS 2)',
    weekRange: 'Weeks 3-5',
    description: 'Master ROS 2 architecture, communication patterns, and robot modeling. Build your first autonomous nodes and understand the foundational messaging system that powers modern robotics.',
    learningOutcomes: [
      'Design and implement ROS 2 publisher-subscriber and service-client patterns',
      'Model robots using URDF and visualize them in RViz2',
      'Create custom messages and services for inter-node communication',
      'Debug distributed systems using ROS 2 CLI tools (ros2 topic, ros2 node, rqt_graph)'
    ],
    icon: '🤖'
  },
  {
    id: 'module-2-digital-twin',
    title: 'Module 2: Digital Twins - Simulation & Sensors',
    weekRange: 'Weeks 6-7',
    description: 'Create photorealistic digital twins in Gazebo and Unity. Integrate camera, LiDAR, and IMU sensors to enable autonomous perception before deploying to real hardware.',
    learningOutcomes: [
      'Build Gazebo worlds with physics-accurate environments',
      'Integrate RGB-D cameras and 2D LiDAR into simulated robots',
      'Implement sensor fusion algorithms (camera + LiDAR)',
      'Develop Unity-ROS 2 integrations for high-fidelity rendering'
    ],
    icon: '🎮'
  },
  {
    id: 'module-3-isaac',
    title: 'Module 3: NVIDIA Isaac - Perception & Navigation',
    weekRange: 'Weeks 8-10',
    description: 'Leverage NVIDIA Isaac Sim and Isaac ROS for GPU-accelerated perception. Implement SLAM, object detection, and autonomous navigation using industry-standard algorithms.',
    learningOutcomes: [
      'Deploy Isaac ROS AprilTag and NVBLOX for visual SLAM',
      'Implement Nav2 stack for autonomous navigation and obstacle avoidance',
      'Use Isaac Sim for synthetic data generation and domain randomization',
      'Optimize perception pipelines with NVIDIA Jetson hardware acceleration'
    ],
    icon: '🚀'
  },
  {
    id: 'module-4-vla-humanoids',
    title: 'Module 4: VLA & Humanoid Robotics',
    weekRange: 'Weeks 11-13',
    description: 'Program humanoid robots with Vision-Language-Action (VLA) models. Implement bipedal locomotion, manipulation, and AI-driven decision-making for embodied intelligence.',
    learningOutcomes: [
      'Implement inverse kinematics for humanoid arm and leg control',
      'Design finite state machines for bipedal walking gaits',
      'Integrate OpenVLA or RT-2 models for natural language robot control',
      'Build end-to-end systems combining perception, planning, and actuation'
    ],
    icon: '🦾'
  }
];

function Module({title, weekRange, description, learningOutcomes, icon}: ModuleItem) {
  return (
    <div className={clsx('col col--3')}>
      <div className={styles.moduleCard}>
        <div className={styles.moduleIcon}>{icon}</div>
        <Heading as="h3" className={styles.moduleTitle}>{title}</Heading>
        <div className={styles.weekRange}>{weekRange}</div>
        <p className={styles.moduleDescription}>{description}</p>
        <div className={styles.learningOutcomes}>
          <strong>Learning Outcomes:</strong>
          <ul>
            {learningOutcomes.map((outcome, idx) => (
              <li key={idx}>{outcome}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <Heading as="h2">Course Modules</Heading>
          <p>Master Physical AI through hands-on projects and real-world applications</p>
        </div>
        <div className="row">
          {ModuleList.map((props, idx) => (
            <Module key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
