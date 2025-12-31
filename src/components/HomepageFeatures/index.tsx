import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type ModuleItem = {
  id: string;
  title: string;
  weekRange: string;
  description: string;
  learningOutcomes: string[];
  icon: string;
  link: string;
};

const ModuleList: ModuleItem[] = [
  {
    id: 'module-1-ros2',
    title: 'Module 1: The Robotic Nervous System (ROS 2)',
    weekRange: 'Weeks 3-5',
    description: 'Master ROS 2 architecture, communication patterns, and robot modeling. Learn to build distributed robotic systems using nodes, topics, services, and actions.',
    learningOutcomes: [
      'Explain the ROS 2 computation graph and its components',
      'Create publishers, subscribers, and service clients using rclpy',
      'Define robot structure using URDF and visualize in RViz2',
      'Launch multi-node systems and debug distributed applications'
    ],
    icon: '🤖',
    link: '/docs/02-ros2-fundamentals'
  },
  {
    id: 'module-2-digital-twin',
    title: 'Module 2: Digital Twins - Simulation & Sensors',
    weekRange: 'Weeks 6-7',
    description: 'Build digital twins for robotic systems using Gazebo and Unity. Simulate sensors, physics, and environments for testing before deploying to physical hardware.',
    learningOutcomes: [
      'Create Gazebo simulation environments with physics and sensors',
      'Integrate Unity for photorealistic sensor simulation',
      'Test navigation and perception algorithms in simulation',
      'Bridge simulated and real robot workflows'
    ],
    icon: '🎮',
    link: '/docs/04-gazebo-simulation'
  },
  {
    id: 'module-3-isaac',
    title: 'Module 3: NVIDIA Isaac - Perception & Navigation',
    weekRange: 'Weeks 8-10',
    description: 'Leverage NVIDIA Isaac Sim for GPU-accelerated robotics. Implement VSLAM, Nav2 navigation stacks, and reinforcement learning for autonomous behaviors.',
    learningOutcomes: [
      'Set up and configure NVIDIA Isaac Sim environments',
      'Implement Visual SLAM for robot localization',
      'Deploy Nav2 navigation stack for autonomous navigation',
      'Train reinforcement learning policies in Isaac Gym'
    ],
    icon: '🚀',
    link: '/docs/06-isaac-sim-basics'
  },
  {
    id: 'module-4-vla-humanoids',
    title: 'Module 4: VLA & Humanoid Robotics',
    weekRange: 'Weeks 11-13',
    description: 'Integrate Vision-Language-Action models with humanoid robots. Master humanoid kinematics, manipulation, and conversational AI for natural human-robot interaction.',
    learningOutcomes: [
      'Calculate forward and inverse kinematics for humanoid robots',
      'Implement manipulation primitives for pick-and-place tasks',
      'Integrate conversational AI with robot action planning',
      'Deploy end-to-end VLA systems for voice-driven robotics'
    ],
    icon: '🦾',
    link: '/docs/08-legged-locomotion'
  }
];

function Module({id, title, weekRange, description, learningOutcomes, icon, link}: ModuleItem) {
  return (
    <div className={clsx('col col--3')}>
      <Link to={link} className={styles.moduleLink}>
        <div className={clsx(styles.moduleCard, styles[id])}>
          <div className={styles.moduleHeader}>
            <div className={styles.moduleIcon}>{icon}</div>
            <div className={styles.weekRange}>{weekRange}</div>
          </div>
          <Heading as="h3" className={styles.moduleTitle}>{title}</Heading>
          <p className={styles.moduleDescription}>{description}</p>
          <div className={styles.learningOutcomes}>
            <div className={styles.outcomesHeader}>
              <span className={styles.outcomesIcon}>✓</span>
              <strong>What You'll Master</strong>
            </div>
            <ul>
              {learningOutcomes.map((outcome, idx) => (
                <li key={idx}>{outcome}</li>
              ))}
            </ul>
          </div>
        </div>
      </Link>
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
