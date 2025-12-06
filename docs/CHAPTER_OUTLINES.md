# Chapter Outlines: Physical AI & Humanoid Robotics Textbook

**Status**: Draft outlines for Chapters 2-13 (awaiting approval)
**Created**: 2025-12-05
**Author**: Based on course syllabus provided by instructor

---

## Module 1: The Robotic Nervous System (ROS 2)
**Weeks**: 3-5 | **Chapters**: 2-3

---

### Chapter 2: ROS 2 Fundamentals
**Week**: 3-4 | **Word Count**: 8,000 | **Difficulty**: Beginner-Intermediate

#### Learning Objectives
1. Explain ROS 2 architecture (nodes, topics, services, actions)
2. Build ROS 2 packages using Python (`rclpy`)
3. Implement publisher/subscriber communication patterns
4. Use ROS 2 command-line tools for debugging
5. Launch multi-node systems with launch files

#### Section Outline

**2.1 Introduction: Why ROS 2?**
- Evolution from ROS 1 to ROS 2 (DDS middleware, real-time support)
- Industry adoption (Waymo, Amazon Robotics, NASA)
- Key improvements: Security, multi-robot systems, Windows support
- **Citation**: ROS 2 Design Document (Open Robotics, 2022)

**2.2 ROS 2 Architecture**
- **Nodes**: Independent processes (analogy: apps on a phone)
- **Topics**: Publish/subscribe messaging (1-to-N communication)
- **Services**: Request/response calls (1-to-1 synchronous)
- **Actions**: Long-running tasks with feedback/cancel (e.g., navigate_to_pose)
- **Parameters**: Runtime configuration (node settings)
- **Diagram**: ROS 2 computation graph (nodes connected via topics/services)

**2.3 Setting Up ROS 2 on Windows**
<details>
<summary>Windows 10/11 + Docker Setup</summary>

```powershell
# Pull ROS 2 Humble Docker image
docker pull osrf/ros:humble-desktop

# Run container with GUI forwarding
docker run -it --name ros2_dev osrf/ros:humble-desktop

# Inside container:
ros2 --version
# Expected: ros2 cli version: 0.18.5
```
</details>

- Alternative: WSL2 native installation (for advanced users)
- Alternative: GitHub Codespaces (one-click setup)
- **Time estimate**: 15 minutes

**2.4 Your First ROS 2 Node (Talker/Listener)**

**Code Example 1**: Publisher (Talker)
```python
# talker.py - Publishes messages to /chatter topic
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class TalkerNode(Node):
    def __init__(self):
        super().__init__('talker')
        self.publisher_ = self.create_publisher(String, 'chatter', 10)
        self.timer = self.create_timer(1.0, self.timer_callback)
        self.count = 0

    def timer_callback(self):
        msg = String()
        msg.data = f'Hello from ROS 2: {self.count}'
        self.publisher_.publish(msg)
        self.get_logger().info(f'Published: "{msg.data}"')
        self.count += 1

def main():
    rclpy.init()
    node = TalkerNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()
```

**Code Example 2**: Subscriber (Listener)
```python
# listener.py - Subscribes to /chatter topic
# (Full code provided)
```

**Running**:
```bash
# Terminal 1:
ros2 run my_package talker

# Terminal 2:
ros2 run my_package listener
```

**Expected Output**: Listener prints messages from Talker

**2.5 Building ROS 2 Packages**
- Package structure: `package.xml`, `setup.py`, `CMakeLists.txt` (C++)
- Creating a Python package with `ros2 pkg create`
- Dependencies and build system (ament_python vs ament_cmake)
- **Code Example 3**: Complete package structure for `my_robot_controller`

**2.6 ROS 2 Topics Deep Dive**
- Message types: `std_msgs`, `geometry_msgs`, `sensor_msgs`
- Quality of Service (QoS): Reliability, durability, history depth
- Introspection tools:
  - `ros2 topic list` - Show all active topics
  - `ros2 topic echo /chatter` - Monitor topic data
  - `ros2 topic hz /chatter` - Measure publish rate
  - `ros2 topic info /chatter` - Show publishers/subscribers

**Code Example 4**: Velocity controller for simulated robot
```python
# Control robot with cmd_vel topic (geometry_msgs/Twist)
# Forward: linear.x = 0.5, angular.z = 0.0
# Turn left: linear.x = 0.0, angular.z = 0.5
```

**2.7 ROS 2 Services**
- Synchronous request/response pattern
- Use cases: Trigger actions (e.g., /reset_simulation), query state (e.g., /get_robot_pose)
- **Code Example 5**: Service client to add two integers
- **Code Example 6**: Service server for robot pose

**2.8 ROS 2 Actions**
- Asynchronous tasks with feedback
- Use case: Navigation (send goal → get feedback on progress → receive result)
- Action states: ACCEPTED → EXECUTING → SUCCEEDED/ABORTED/CANCELED
- **Code Example 7**: Fibonacci action server (tutorial)
- **Code Example 8**: Navigation action client (send waypoint, monitor progress)

**2.9 Launch Files**
- Starting multiple nodes with one command
- XML vs Python vs YAML launch files
- **Code Example 9**: Launch talker + listener simultaneously
```python
# talker_listener_launch.py
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(package='my_package', executable='talker'),
        Node(package='my_package', executable='listener'),
    ])
```

**2.10 Parameters and Configuration**
- Runtime configuration without recompiling
- Declaring parameters in nodes
- **Code Example 10**: Configurable timer frequency for talker

**2.11 Debugging Tools**
- `ros2 node list` - Show running nodes
- `ros2 node info /talker` - Inspect node connections
- `rqt_graph` - Visualize computation graph (GUI)
- `ros2 doctor` - Check ROS 2 installation health

**2.12 Best Practices**
- One node = one responsibility (e.g., camera_driver, object_detector, path_planner)
- Use namespaces for multi-robot systems
- Document node interfaces (topics, services, parameters)
- Error handling and logging

#### Exercises

**Exercise 2.1**: Build a custom publisher that sends robot odometry (position, velocity)

**Exercise 2.2**: Create a service that calculates inverse kinematics for a 2-DOF arm

**Exercise 2.3**: Implement an action server for battery charging (feedback: % charged)

#### Citations (15 total)
1. Macenski, S., et al. (2022). *Robot Operating System 2: Design, architecture, and uses in the wild.* Science Robotics.
2. Open Robotics. (2023). *ROS 2 Design Document.* https://design.ros2.org/
3. Quigley, M., et al. (2009). *ROS: an open-source Robot Operating System.* ICRA Workshop.

#### Hardware Requirements
- **Minimum**: Any computer (cloud/Codespaces works)
- **Recommended**: Windows 10/11 + Docker Desktop
- **No GPU required** for this chapter

#### Lab
- **lab-02-1-ros2-hello-world**: Talker/listener in Docker container, launch file example

---

### Chapter 3: URDF & Robot Modeling
**Week**: 5 | **Word Count**: 7,000 | **Difficulty**: Intermediate

#### Learning Objectives
1. Describe robot geometry using URDF (Unified Robot Description Format)
2. Define kinematic chains (links, joints) for humanoid robots
3. Use Xacro for modular URDF design
4. Visualize robots in RViz
5. Publish robot state with `robot_state_publisher`

#### Section Outline

**3.1 Introduction: Describing Robot Geometry**
- Why URDF? (Standard format for ROS, supported by all simulators)
- URDF vs SDF (Simulation Description Format for Gazebo)
- **Example**: TurtleBot3, Unitree Go2, Unitree G1 URDF files

**3.2 URDF Structure**
- **Links**: Rigid bodies (visual, collision, inertial properties)
- **Joints**: Connections between links (revolute, prismatic, fixed, continuous)
- **XML syntax**: `<robot>`, `<link>`, `<joint>`, `<material>`

**Code Example 1**: Simple 2-link arm
```xml
<robot name="simple_arm">
  <!-- Base link (fixed to world) -->
  <link name="base_link">
    <visual>
      <geometry><box size="0.1 0.1 0.1"/></geometry>
      <material name="blue"><color rgba="0 0 1 1"/></material>
    </visual>
  </link>

  <!-- First link (upper arm) -->
  <link name="link1">
    <visual>
      <geometry><cylinder radius="0.05" length="0.5"/></geometry>
      <material name="red"><color rgba="1 0 0 1"/></material>
    </visual>
  </link>

  <!-- Joint connecting base to link1 -->
  <joint name="joint1" type="revolute">
    <parent link="base_link"/>
    <child link="link1"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="10" velocity="1.0"/>
  </joint>
</robot>
```

**3.3 Link Properties**
- **Visual**: Appearance (mesh files, STL, DAE, or primitives)
- **Collision**: Simplified geometry for physics (often boxes/cylinders)
- **Inertial**: Mass, center of mass, inertia tensor (required for dynamics)

**Code Example 2**: Link with inertial properties
```xml
<link name="link1">
  <inertial>
    <mass value="2.5"/>
    <inertia ixx="0.1" ixy="0.0" ixz="0.0" iyy="0.1" iyz="0.0" izz="0.1"/>
  </inertial>
  <!-- visual and collision here -->
</link>
```

**3.4 Joint Types**
- **Revolute**: Rotational (e.g., elbow, knee) with limits
- **Continuous**: Rotational without limits (e.g., wheel)
- **Prismatic**: Linear (e.g., elevator, telescope arm)
- **Fixed**: Rigidly attached (e.g., camera mount)
- **Planar**, **Floating**: Rarely used (2D motion, free-floating base)

**3.5 Humanoid Kinematic Chain**
- Torso (base link) → Legs (6 DOF per leg: hip roll/pitch/yaw, knee, ankle pitch/roll) → Arms (7 DOF per arm) → Head (2 DOF: pan/tilt)
- **Total DOF**: Typical humanoid = 30-40 joints
- **Diagram**: Unitree G1 kinematic tree

**Code Example 3**: Simplified humanoid leg (6 DOF)
```xml
<!-- Hip roll, hip pitch, hip yaw, knee, ankle pitch, ankle roll -->
<joint name="left_hip_roll" type="revolute">...</joint>
<joint name="left_hip_pitch" type="revolute">...</joint>
<!-- etc. -->
```

**3.6 Xacro: Macros for URDF**
- Problem: URDF is verbose and repetitive (copy-paste for left/right legs)
- Solution: Xacro (XML Macros) - parameterized URDF generation
- **Features**: Variables, math expressions, macros, includes

**Code Example 4**: Xacro macro for robot leg
```xml
<xacro:macro name="leg" params="prefix reflect">
  <!-- prefix = "left" or "right", reflect = 1 or -1 for mirroring -->
  <joint name="${prefix}_hip_roll" type="revolute">
    <axis xyz="${reflect} 0 0"/>
    <!-- etc. -->
  </joint>
</xacro:macro>

<!-- Instantiate left and right legs -->
<xacro:leg prefix="left" reflect="1"/>
<xacro:leg prefix="right" reflect="-1"/>
```

**3.7 Meshes and Visual Fidelity**
- Using STL/DAE/OBJ files for realistic appearance
- Tools: Blender, Fusion 360, SolidWorks
- **Example**: Download Unitree Go2 meshes, integrate into URDF

**3.8 Visualizing in RViz**
- RViz: 3D visualization tool for ROS
- `robot_state_publisher`: Publishes TF transforms from URDF
- `joint_state_publisher`: GUI to control joint angles

**Setup**:
```bash
# Inside WSL2 terminal or Docker:
ros2 launch urdf_tutorial display.launch.py model:=my_robot.urdf
```

**Expected**: RViz opens, robot model visible, GUI sliders control joints

**3.9 Transform Frames (TF2)**
- Every link has a coordinate frame
- TF tree: Parent-child relationships (base_link → left_hip → left_knee → left_ankle)
- **Tools**:
  - `ros2 run tf2_tools view_frames` - Generate TF tree PDF
  - `ros2 run tf2_ros tf2_echo base_link left_foot` - Print transform

**3.10 Collision and Physics Preparation**
- Collision geometry (simple shapes for fast computation)
- **Best practice**: Visual = high-poly mesh, Collision = low-poly boxes/cylinders
- Self-collision filtering (e.g., thigh can't collide with torso)

**3.11 Exporting from CAD**
- Fusion 360 URDF Exporter plugin
- SolidWorks to URDF plugin
- **Workflow**: Design in CAD → Export meshes + URDF → Import into ROS

**3.12 URDF for Unitree G1 Humanoid**
- **Case study**: Analyzing Unitree G1 official URDF
- Link names, joint limits, mass distribution
- **Code Example 5**: Load Unitree G1 URDF, visualize in RViz

#### Exercises

**Exercise 3.1**: Create URDF for a 4-legged table (4 legs + 1 tabletop, all fixed joints)

**Exercise 3.2**: Model a 3-DOF robot arm (shoulder pan/tilt, elbow), visualize in RViz

**Exercise 3.3**: Add collision geometry to your arm, verify in RViz (enable collision view)

#### Citations (12 total)
1. ROS.org. (2023). *URDF XML Specification.* http://wiki.ros.org/urdf/XML
2. Unitree Robotics. (2024). *G1 Humanoid URDF Repository.* https://github.com/unitreerobotics/unitree_ros
3. Kam, H. R., et al. (2015). *RViz: A Toolkit for Real Domain Data Visualization.* Telecommunications Systems.

#### Hardware Requirements
- **Minimum**: Any computer (RViz works in Docker with X11 forwarding)
- **Recommended**: Windows 10/11 + VcXsrv for GUI
- **No GPU required**

#### Lab
- **lab-03-1-urdf-robot**: Build quadruped URDF, visualize in RViz with joint sliders

---

## Module 2: The Digital Twin (Gazebo & Unity)
**Weeks**: 6-7 | **Chapters**: 4-5

---

### Chapter 4: Gazebo Simulation
**Week**: 6 | **Word Count**: 7,500 | **Difficulty**: Intermediate

#### Learning Objectives
1. Set up Gazebo simulation environments
2. Spawn robots from URDF into Gazebo worlds
3. Simulate sensors (LIDAR, cameras, IMU, contact sensors)
4. Apply forces, model physics (gravity, friction, collisions)
5. Integrate Gazebo with ROS 2

#### Section Outline

**4.1 Introduction: Why Simulate?**
- Benefits: Safe testing, rapid iteration, synthetic data generation, zero hardware cost
- Gazebo vs other simulators (Isaac Sim, MuJoCo, PyBullet)
- **Industry use**: Waymo simulates 20 billion miles/year

**4.2 Gazebo Architecture**
- **Client-server**: `gzserver` (physics engine) + `gzclient` (GUI)
- **Physics engines**: ODE (default), Bullet, Simbody, DART
- **Plugins**: Custom sensors, controllers, world logic

**4.3 Installing Gazebo on Windows**
<details>
<summary>Windows 10/11 + Docker Setup</summary>

```powershell
# Pull Gazebo + ROS 2 image
docker pull osrf/ros:humble-desktop-full

# Run with GUI forwarding (requires VcXsrv)
docker run -it -e DISPLAY=host.docker.internal:0 osrf/ros:humble-desktop-full

# Inside container:
gazebo --version
# Expected: Gazebo multi-robot simulator, version 11.10.2
```
</details>

**4.4 World Files (SDF Format)**
- SDF (Simulation Description Format): XML for worlds, models, plugins
- **Code Example 1**: Empty world with ground plane
```xml
<sdf version="1.6">
  <world name="my_world">
    <include><uri>model://sun</uri></include>
    <include><uri>model://ground_plane</uri></include>
  </world>
</sdf>
```

**4.5 Spawning Robots**
- Convert URDF → SDF (automatic via `spawn_entity.py`)
- **Code Example 2**: Spawn robot from URDF
```bash
ros2 run gazebo_ros spawn_entity.py -entity my_robot -file my_robot.urdf -x 0 -y 0 -z 0.5
```

**4.6 Physics Simulation**
- **Gravity**: Default 9.81 m/s² (configurable)
- **Friction**: Static, kinetic, rolling resistance
- **Collisions**: Bounding boxes, convex hulls, mesh-based
- **Contact forces**: Normal force, tangential force (for grasping)

**Code Example 3**: Custom friction for robot wheels
```xml
<surface>
  <friction>
    <ode>
      <mu>0.8</mu>   <!-- Coefficient of friction -->
      <mu2>0.8</mu2>
    </ode>
  </friction>
</surface>
```

**4.7 Simulated Sensors**

**4.7.1 Camera Plugin**
```xml
<sensor name="camera" type="camera">
  <update_rate>30</update_rate>
  <camera>
    <horizontal_fov>1.047</horizontal_fov>  <!-- 60 degrees -->
    <image>
      <width>640</width>
      <height>480</height>
    </image>
  </camera>
  <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
    <ros>
      <namespace>/robot</namespace>
      <remapping>image_raw:=camera/image_raw</remapping>
    </ros>
  </plugin>
</sensor>
```

**4.7.2 LIDAR Plugin**
```xml
<sensor name="lidar" type="ray">
  <ray>
    <scan>
      <horizontal>
        <samples>360</samples>
        <resolution>1</resolution>
        <min_angle>-3.14159</min_angle>
        <max_angle>3.14159</max_angle>
      </horizontal>
    </scan>
    <range><min>0.1</min><max>10.0</max></range>
  </ray>
  <plugin name="lidar_controller" filename="libgazebo_ros_ray_sensor.so">
    <ros>
      <remapping>~/out:=scan</remapping>
    </ros>
  </plugin>
</sensor>
```

**4.7.3 IMU Plugin**
```xml
<sensor name="imu" type="imu">
  <imu>
    <angular_velocity>
      <x><noise type="gaussian"><stddev>0.01</stddev></noise></x>
    </angular_velocity>
  </imu>
  <plugin name="imu_plugin" filename="libgazebo_ros_imu_sensor.so"/>
</sensor>
```

**4.8 Robot Control in Gazebo**
- **Differential drive**: Control via `/cmd_vel` (Twist messages)
- **Joint controllers**: Position, velocity, effort (torque) control
- **Code Example 4**: Velocity controller plugin
```xml
<plugin name="diff_drive" filename="libgazebo_ros_diff_drive.so">
  <left_joint>left_wheel_joint</left_joint>
  <right_joint>right_wheel_joint</right_joint>
  <wheel_separation>0.4</wheel_separation>
  <wheel_diameter>0.2</wheel_diameter>
  <command_topic>/cmd_vel</command_topic>
</plugin>
```

**4.9 Building Custom Worlds**
- Model library: Pre-made objects (tables, chairs, walls)
- Building editor: GUI for creating structures
- **Code Example 5**: World with obstacles (maze for navigation testing)

**4.10 Domain Randomization**
- Randomize object poses, textures, lighting
- **Purpose**: Sim-to-real transfer (train robust policies)
- **Code Example 6**: Python script to randomize world parameters

**4.11 Performance Optimization**
- Real-time factor (RTF): Simulation speed / real-time speed (target: 1.0)
- **Tips**:
  - Use simple collision geometry (boxes > meshes)
  - Reduce sensor update rates (10 Hz vs 100 Hz)
  - Disable GUI (`gzserver` only) for faster batch simulations

**4.12 Gazebo + ROS 2 Integration**
- Launch file combining ROS 2 nodes + Gazebo
- **Code Example 7**: Complete launch file (spawn robot, start teleoperation)

#### Exercises

**Exercise 4.1**: Create a world with 10 random boxes, spawn a robot, write a node to avoid collisions

**Exercise 4.2**: Add a camera sensor to a robot, subscribe to `/camera/image_raw`, display using OpenCV

**Exercise 4.3**: Measure simulation accuracy (drop a ball from 1m height, measure impact time, compare to physics formula)

#### Citations (10 total)
1. Koenig, N., & Howard, A. (2004). *Design and use paradigms for Gazebo, an open-source multi-robot simulator.* IROS 2004.
2. Open Robotics. (2023). *Gazebo Simulation Documentation.* https://gazebosim.org/

#### Hardware Requirements
- **Minimum**: 4 GB RAM, integrated GPU (RTF ~0.5)
- **Recommended**: 8 GB RAM, dedicated GPU (RTF ~1.0)

#### Labs
- **lab-04-1-gazebo-world**: Custom world with obstacles, camera/LIDAR sensors
- **lab-04-2-gazebo-control**: Teleoperation, waypoint navigation

---

### Chapter 5: Unity Robotics Hub
**Week**: 7 | **Word Count**: 6,500 | **Difficulty**: Intermediate

#### Learning Objectives
1. Set up Unity for robotics simulation
2. Connect Unity to ROS 2 via TCP endpoint
3. Import robot models (URDF) into Unity
4. Create high-fidelity environments for human-robot interaction
5. Generate synthetic training data (images, depth, segmentation)

#### Section Outline

**5.1 Introduction: Why Unity?**
- **Gazebo**: Great physics, poor graphics
- **Unity**: Photorealistic rendering, human-scale environments, VR/AR support
- **Use case**: Training vision models with synthetic data, HRI testing

**5.2 Unity Robotics Hub Overview**
- **ROS-TCP-Connector**: Bidirectional communication (Unity ↔ ROS 2)
- **URDF Importer**: Load robot models into Unity
- **Articulation Body**: Unity's physics engine for robots

**5.3 Installing Unity on Windows (Native!)**
<details>
<summary>Windows 10/11 Setup (No WSL2 Needed)</summary>

```powershell
# Download Unity Hub
# https://unity.com/download

# Install Unity 2022.3 LTS (recommended for robotics)
# Add modules: Linux Build Support, Windows Build Support

# Install ROS-TCP-Connector package
# (Via Unity Package Manager → Add from git URL)
```
</details>

**Note**: Unity runs **natively on Windows**—one of the few robotics tools that does!

**5.4 ROS-TCP-Connector Setup**
- **Server**: ROS 2 node listens on TCP port (default: 10000)
- **Client**: Unity connects, sends/receives ROS messages
- **Code Example 1**: Launch ROS-TCP-Endpoint
```bash
# Inside WSL2 terminal:
ros2 run ros_tcp_endpoint default_server_endpoint --ros-args -p ROS_IP:=0.0.0.0
```

**Code Example 2**: Unity C# script to publish `/cmd_vel`
```csharp
using Unity.Robotics.ROSTCPConnector;
using RosMessageTypes.Geometry;

public class VelocityPublisher : MonoBehaviour {
    ROSConnection ros;

    void Start() {
        ros = ROSConnection.GetOrCreateInstance();
        ros.RegisterPublisher<TwistMsg>("/cmd_vel");
    }

    void Update() {
        TwistMsg twist = new TwistMsg {
            linear = new Vector3Msg { x = 0.5, y = 0, z = 0 },
            angular = new Vector3Msg { x = 0, y = 0, z = 0.1 }
        };
        ros.Publish("/cmd_vel", twist);
    }
}
```

**5.5 Importing URDF into Unity**
- **URDF Importer** package (Unity Robotics Hub)
- **Workflow**: URDF → Unity Asset → Scene
- **Code Example 3**: Import Unitree Go2 URDF

**5.6 Articulation Body (Physics)**
- Unity's physics engine for multi-body robots
- Joint types: Revolute, Prismatic, Fixed, Spherical
- **Code Example 4**: Configure articulation for robot arm

**5.7 Simulating Sensors in Unity**
- **Camera**: RGB, depth, segmentation
- **Perception Package**: Ground truth labels for ML training
- **Code Example 5**: Capture RGB-D images, publish to ROS

**5.8 High-Fidelity Environments**
- Asset Store: Pre-made environments (offices, homes, warehouses)
- ProBuilder: Build custom environments in Unity Editor
- **Example**: Create kitchen scene for manipulation tasks

**5.9 Human-Robot Interaction**
- Animated human models (Mixamo, Asset Store)
- Social navigation scenarios (robot navigating around humans)
- **Code Example 6**: Human waypoint navigation (NPC movement)

**5.10 Synthetic Data Generation**
- **Use case**: Train object detectors without real-world data
- **Perception Package**: Randomize object poses, lighting, textures
- **Dataset**: 10,000 labeled images in 1 hour
- **Code Example 7**: Domain randomization script

**5.11 Unity ML-Agents (Preview)**
- Train robot policies with reinforcement learning
- **Example**: Train quadruped to walk using PPO
- Integration with ROS 2 (actions → observations → rewards)

**5.12 Unity vs Gazebo: When to Use Which?**

| **Feature** | **Gazebo** | **Unity** |
|-------------|------------|-----------|
| Physics accuracy | ⭐⭐⭐⭐⭐ (ODE, Bullet) | ⭐⭐⭐⭐ (PhysX) |
| Visual fidelity | ⭐⭐ (Basic rendering) | ⭐⭐⭐⭐⭐ (Photorealistic) |
| ROS integration | ⭐⭐⭐⭐⭐ (Native) | ⭐⭐⭐ (TCP bridge) |
| Ease of use | ⭐⭐⭐ (SDF/URDF) | ⭐⭐⭐⭐ (GUI editor) |
| Performance | ⭐⭐⭐ (CPU-heavy) | ⭐⭐⭐⭐ (GPU-accelerated) |
| Cost | Free (open-source) | Free (Personal), Paid (Pro) |

**Recommendation**: Use **Gazebo** for navigation/manipulation testing. Use **Unity** for vision training and HRI.

#### Exercises

**Exercise 5.1**: Import a robot URDF into Unity, control joints via ROS

**Exercise 5.2**: Create a kitchen scene, place objects, capture 100 RGB-D images

**Exercise 5.3**: Implement social navigation (robot avoids moving humans)

#### Citations (8 total)
1. Unity Technologies. (2023). *Unity Robotics Hub Documentation.* https://github.com/Unity-Technologies/Unity-Robotics-Hub
2. Juliani, A., et al. (2018). *Unity: A general platform for intelligent agents.* arXiv preprint.

#### Hardware Requirements
- **Minimum**: NVIDIA GTX 1060 (for rendering)
- **Recommended**: NVIDIA RTX 3060 (for real-time ray tracing)

#### Lab
- **lab-05-1-unity-tcp-connector**: Unity scene + ROS bridge, teleoperation, synthetic image capture

---

## Module 3: The AI-Robot Brain (NVIDIA Isaac)
**Weeks**: 8-10 | **Chapters**: 6-7

---

### Chapter 6: NVIDIA Isaac Sim Basics
**Week**: 8-9 | **Word Count**: 8,000 | **Difficulty**: Advanced

#### Learning Objectives
1. Install and configure NVIDIA Isaac Sim (Windows native)
2. Create USD (Universal Scene Description) scenes
3. Generate synthetic training data (images, annotations, depth)
4. Simulate humanoid robots with accurate physics
5. Use Isaac Sim Python API for automation

#### Section Outline

**6.1 Introduction: The Isaac Platform**
- **Isaac Sim**: Omniverse-based photorealistic simulator
- **Isaac ROS**: Hardware-accelerated perception (Chapter 7)
- **Isaac Gym**: RL training (massively parallel GPU simulation)
- **Why Isaac?** RTX ray tracing, synthetic data, NVIDIA AI integration

**6.2 Installing Isaac Sim on Windows (Native!)**
<details>
<summary>Windows 10/11 Setup (No WSL2/Docker Needed)</summary>

```powershell
# 1. Download NVIDIA Omniverse Launcher
# https://www.nvidia.com/en-us/omniverse/download/

# 2. Install Omniverse Launcher (runs natively on Windows)

# 3. Inside Launcher: Library → Install "Isaac Sim"

# 4. Launch Isaac Sim
# Expected: USD scene opens in viewport

# System Requirements:
# - NVIDIA RTX GPU (2060 or higher)
# - Windows 10/11 (64-bit)
# - 32 GB RAM (recommended)
```
</details>

**Important**: Isaac Sim has **full Windows support** (unlike many Linux-only robotics tools).

**6.3 USD (Universal Scene Description)**
- Pixar's scene format (used in film VFX)
- **Hierarchy**: Stage → Prims (objects) → Properties (transforms, materials)
- **Code Example 1**: Create simple USD scene via Python

```python
from pxr import Usd, UsdGeom

stage = Usd.Stage.CreateNew("my_scene.usd")
xform = UsdGeom.Xform.Define(stage, "/World")
sphere = UsdGeom.Sphere.Define(stage, "/World/Sphere")
sphere.GetRadiusAttr().Set(0.5)

stage.Save()
```

**6.4 Isaac Sim GUI Tour**
- **Viewport**: 3D view (real-time ray tracing)
- **Stage**: Hierarchy of objects (similar to Unity/Unreal)
- **Property Panel**: Modify object attributes
- **Content Browser**: Asset library (robots, environments)

**6.5 Importing Robots**
- **URDF Import**: File → Import → URDF
- **Fixes joint axes, generates USD representation**
- **Code Example 2**: Import Unitree G1 URDF
```python
import omni.isaac.urdf
urdf_interface = omni.isaac.urdf.get_interface()
urdf_interface.parse_urdf("/path/to/unitree_g1.urdf", "/World/G1")
```

**6.6 Physics Simulation (PhysX 5)**
- **Rigid body dynamics**: Mass, inertia, damping
- **Articulations**: Multi-body robots (optimized solver)
- **Contacts**: Friction, restitution, contact offset
- **Code Example 3**: Configure joint drive (PD controller)

**6.7 Creating Environments**
- **Asset Library**: Pre-made warehouses, offices, outdoor scenes
- **Materials**: PBR (Physically-Based Rendering) for realism
- **Lighting**: HDR skydomes, point lights, spotlights
- **Code Example 4**: Build kitchen environment programmatically

**6.8 Cameras and Sensors**
- **RGB Camera**: Photorealistic rendering
- **Depth Camera**: Ray-traced depth
- **Segmentation**: Instance/semantic masks
- **LIDAR**: Ray-traced laser scanning
- **Code Example 5**: Capture annotated images for training
```python
import omni.replicator.core as rep

camera = rep.create.camera(position=(2, 2, 2), look_at=(0, 0, 0))
render_product = rep.create.render_product(camera, (640, 480))

writer = rep.WriterRegistry.get("BasicWriter")
writer.initialize(output_dir="./output", rgb=True, semantic_segmentation=True)
writer.attach([render_product])

rep.orchestrator.run()
```

**6.9 Synthetic Data Generation**
- **Domain Randomization**: Randomize textures, lighting, poses
- **Replicator**: Isaac's data generation framework
- **Use case**: Generate 100,000 images for training object detectors
- **Code Example 6**: Randomize object positions/colors

**6.10 ROS 2 Bridge**
- **OmniGraph**: Visual scripting for ROS topics
- **Publish**: Joint states, camera images, LIDAR scans
- **Subscribe**: Velocity commands, joint commands
- **Code Example 7**: Publish camera feed to `/camera/image_raw`

**6.11 Python Scripting (Standalone)**
- **Standalone mode**: Run Isaac Sim headless (no GUI)
- **Automation**: Batch data generation, CI/CD testing
- **Code Example 8**: Spawn 100 robots in parallel scenes
```python
from omni.isaac.kit import SimulationApp
simulation_app = SimulationApp({"headless": True})

from omni.isaac.core import World
world = World()

# Spawn robots, run simulation
for i in range(100):
    world.scene.add(robot_factory.create(f"/World/Robot_{i}"))

while True:
    world.step(render=False)
```

**6.12 Performance Optimization**
- **RTX GPUs**: 10x faster ray tracing
- **Multi-GPU**: Distribute scenes across GPUs
- **LOD (Level of Detail)**: Simplify meshes at distance
- **Culling**: Don't render off-camera objects

#### Exercises

**Exercise 6.1**: Create a USD scene with 50 random objects, capture 1,000 annotated images

**Exercise 6.2**: Import Unitree G1, make it walk using joint position commands

**Exercise 6.3**: Measure rendering FPS with different quality settings (RTX on/off, resolution)

#### Citations (12 total)
1. NVIDIA. (2024). *Isaac Sim Documentation.* https://docs.omniverse.nvidia.com/isaacsim/
2. Liang, J., et al. (2023). *Code as Policies: Language Model Programs for Embodied Control.* ICRA 2023.

#### Hardware Requirements
- **Minimum**: NVIDIA RTX 2060, 16 GB RAM (low quality, 20 FPS)
- **Recommended**: NVIDIA RTX 4070, 32 GB RAM (high quality, 60 FPS)
- **Ideal**: NVIDIA RTX 4090, 64 GB RAM (ultra quality, real-time ray tracing)

#### Labs
- **lab-06-1-isaac-first-scene**: Create kitchen scene, spawn objects, capture RGB-D images
- **lab-06-2-isaac-robot-control**: Import humanoid, control joints via ROS 2

---

### Chapter 7: Isaac ROS Integration
**Week**: 10 | **Word Count**: 7,500 | **Difficulty**: Advanced

#### Learning Objectives
1. Install Isaac ROS packages on NVIDIA Jetson
2. Implement Visual SLAM (VSLAM) with hardware acceleration
3. Use Isaac ROS for object detection (DOPE, FoundationPose)
4. Integrate Nav2 for autonomous navigation
5. Deploy sim-trained policies to real robots

#### Section Outline

**7.1 Introduction: Why Isaac ROS?**
- **Problem**: ROS perception is CPU-bound (SLAM at 10 Hz, object detection at 2 FPS)
- **Solution**: Isaac ROS uses NVIDIA GPUs (SLAM at 100 Hz, detection at 30 FPS)
- **Hardware**: NVIDIA Jetson Orin (40-275 TOPS AI performance)

**7.2 Isaac ROS Architecture**
- **GXF (Graph Execution Framework)**: NVIDIA's dataflow framework
- **NITROS (NVIDIA Isaac Transport for ROS)**: Zero-copy message passing
- **DNN Inference**: TensorRT-optimized models

**7.3 Setting Up Jetson Orin**
<details>
<summary>Windows + Jetson Workflow</summary>

**On Windows 10/11**:
1. Flash Jetson Orin with JetPack SDK (via NVIDIA SDK Manager)
2. Connect via SSH: `ssh nvidia@<jetson-ip>`

**On Jetson (Linux)**:
```bash
# Install Isaac ROS
sudo apt install ros-humble-isaac-ros-visual-slam

# Connect RealSense camera
lsusb  # Verify D435i detected

# Run VSLAM
ros2 launch isaac_ros_visual_slam isaac_ros_visual_slam.launch.py
```
</details>

**7.4 Visual SLAM (VSLAM)**
- **Purpose**: Build 3D map while tracking camera pose
- **Input**: Stereo cameras (left/right images) OR RGB-D camera
- **Output**: `/visual_slam/tracking/odometry` (robot pose), point cloud
- **Performance**: 100 Hz on Jetson Orin (vs 10 Hz CPU)

**Code Example 1**: Launch VSLAM with RealSense
```bash
ros2 launch isaac_ros_visual_slam realsense_vslam.launch.py
```

**Code Example 2**: Visualize map in RViz
```bash
ros2 run rviz2 rviz2 -d $(ros2 pkg prefix isaac_ros_visual_slam)/share/isaac_ros_visual_slam/rviz/default.rviz
```

**7.5 Object Detection (DOPE)**
- **DOPE**: Deep Object Pose Estimation
- **Purpose**: Detect objects, estimate 6D pose (position + rotation)
- **Use case**: Grasping (know exact pose of cup for manipulation)
- **Code Example 3**: Detect soup cans from camera feed

**7.6 FoundationPose (Zero-Shot Detection)**
- **New approach**: No training per object (uses 3D model only)
- **Input**: RGB-D image + CAD model
- **Output**: 6D pose
- **Code Example 4**: Detect novel objects (e.g., custom tools)

**7.7 Stereo Depth Estimation**
- **Isaac ROS ESS (Efficient Stereo Segmentation)**: DNN-based depth
- **Performance**: 30 FPS on Jetson (vs 10 FPS CPU)
- **Code Example 5**: Publish depth map to `/depth/image_raw`

**7.8 Nav2 Integration**
- **Nav2**: ROS 2 navigation stack (path planning, obstacle avoidance)
- **Costmap**: Occupancy grid (free space, obstacles)
- **Planners**: A*, Dijkstra, Theta*, Smac Planner
- **Controllers**: DWA (Dynamic Window Approach), TEB, MPPI

**Code Example 6**: Launch Nav2 with Isaac VSLAM
```bash
ros2 launch nav2_bringup navigation_launch.py \
  use_sim_time:=False \
  slam:=True \
  slam_params_file:=isaac_vslam_params.yaml
```

**7.9 Bipedal Navigation (Humanoid-Specific)**
- **Challenge**: Humanoids have different dynamics than wheeled robots
- **Footstep planning**: Discrete footstep poses vs continuous paths
- **Balance constraints**: Center of mass must stay within support polygon
- **Code Example 7**: Footstep planner for Unitree G1

**7.10 Sim-to-Real Transfer**
- **Train in Isaac Sim** (infinite data, safe)
- **Deploy to Jetson** (real hardware)
- **Domain randomization**: Bridge sim-real gap
- **Code Example 8**: Load TensorRT model trained in Isaac Sim

**7.11 Performance Benchmarks**

| **Task** | **CPU (x86)** | **GPU (Jetson Orin)** | **Speedup** |
|----------|---------------|------------------------|-------------|
| VSLAM | 10 Hz | 100 Hz | 10x |
| Object Detection | 2 FPS | 30 FPS | 15x |
| Depth Estimation | 5 FPS | 30 FPS | 6x |
| Segmentation | 1 FPS | 20 FPS | 20x |

**7.12 Debugging Isaac ROS**
- **GXF logs**: Check `/tmp/gxf_logs/`
- **NITROS topics**: `ros2 topic list | grep nitros`
- **Latency profiling**: `ros2 run isaac_ros_common isaac_ros_profiler`

#### Exercises

**Exercise 7.1**: Run VSLAM with RealSense, map your room, save PCD file

**Exercise 7.2**: Train DOPE on custom object (YCB dataset), deploy to Jetson

**Exercise 7.3**: Implement Nav2 waypoint navigation, measure success rate over 100 runs

#### Citations (15 total)
1. Tremblay, J., et al. (2018). *Deep Object Pose Estimation for Semantic Robotic Grasping.* CoRL 2018.
2. NVIDIA. (2024). *Isaac ROS Documentation.* https://nvidia-isaac-ros.github.io/

#### Hardware Requirements
- **Required**: NVIDIA Jetson Orin Nano ($249) OR Orin NX ($399)
- **Required**: Intel RealSense D435i ($349)
- **Optional**: RPLIDAR A1 ($99) for 2D SLAM comparison

#### Lab
- **lab-07-1-isaac-ros-vslam**: VSLAM with RealSense, map building, localization

---

## Module 4: Vision-Language-Action (VLA) & Humanoid Development
**Weeks**: 11-13 | **Chapters**: 8-11

---

### Chapter 8: Legged Locomotion
**Week**: 11 | **Word Count**: 7,000 | **Difficulty**: Advanced

#### Learning Objectives
1. Understand bipedal kinematics and dynamics
2. Implement Zero Moment Point (ZMP) balance control
3. Generate walking gaits using preview control
4. Train locomotion policies with reinforcement learning
5. Deploy to Unitree G1 humanoid

#### Section Outline

**8.1 Introduction: Walking is Hard**
- **Challenges**: 40 DOF, underactuated (no direct control of torso position), contact switching (foot on/off ground)
- **Comparison**: Quadrupeds (statically stable), Bipeds (dynamically stable)
- **Example**: Boston Dynamics Atlas parkour, Unitree G1 stair climbing

**8.2 Kinematics**
- **Forward kinematics**: Joint angles → foot position
- **Inverse kinematics**: Desired foot position → joint angles
- **Jacobian**: Velocity mapping (joint velocities → end-effector velocity)
- **Code Example 1**: IK for 6-DOF leg (hip, knee, ankle)

**8.3 Dynamics**
- **Equations of motion**: Lagrangian mechanics, M(q)q̈ + C(q,q̇) + G(q) = τ
- **Centroidal dynamics**: Simplified model (whole-body COM + angular momentum)
- **Code Example 2**: Simulate dynamics in PyBullet

**8.4 Zero Moment Point (ZMP)**
- **Definition**: Point where net moment from gravity and inertia is zero
- **Stability criterion**: ZMP must be inside support polygon (foot contact area)
- **Code Example 3**: Calculate ZMP from COM trajectory

**8.5 Gait Generation**
- **Walking pattern**: Swing phase (foot in air) + Stance phase (foot on ground)
- **Preview control**: Plan COM trajectory to keep ZMP stable
- **Code Example 4**: Generate walking trajectory (Kajita et al. 2003 method)

**8.6 Whole-Body Control**
- **Hierarchical QP**: Optimize joint torques subject to constraints (balance, joint limits, contact forces)
- **Code Example 5**: Whole-body controller in Pinocchio library

**8.7 Reinforcement Learning for Locomotion**
- **Training in Isaac Gym**: 4,096 parallel environments, 10M steps in 1 hour
- **Reward function**: Forward velocity, upright posture, low energy
- **Code Example 6**: Train PPO policy for flat-ground walking

**8.8 Terrain Adaptation**
- **Rough terrain**: Stepping stones, stairs, slopes
- **Perception**: Height map from stereo camera
- **Code Example 7**: Terrain-aware footstep planner

**8.9 Push Recovery**
- **External disturbances**: Sudden pushes, slippery surfaces
- **Strategies**: Step, ankle torque, hip torque
- **Code Example 8**: Detect fall, trigger recovery step

**8.10 Sim-to-Real (Unitree G1)**
- **Domain randomization**: Mass, friction, motor delays
- **System identification**: Measure real robot parameters
- **Code Example 9**: Deploy policy to G1, measure success rate

#### Exercises

**Exercise 8.1**: Implement IK for humanoid leg, verify with visualization

**Exercise 8.2**: Generate 10-step walking trajectory, plot ZMP and COM

**Exercise 8.3**: Train RL policy for stair climbing, evaluate in simulation

#### Citations (18 total)
1. Kajita, S., et al. (2003). *Biped walking pattern generation by using preview control of zero-moment point.* ICRA 2003.
2. Vukobratović, M., & Borovac, B. (2004). *Zero-moment point—thirty five years of its life.* International Journal of Humanoid Robotics.

#### Hardware Requirements
- **Simulation**: Any PC with GPU (Isaac Gym: RTX 3060+)
- **Real robot**: Unitree G1 ($16,000) - optional, shared lab resource

#### Lab
- **lab-08-1-zmp-walking**: Generate walking gait, visualize ZMP stability
- **lab-08-2-rl-locomotion**: Train PPO policy in Isaac Gym, deploy to simulation

---

### Chapter 9: Manipulation & Grasping
**Week**: 12 | **Word Count**: 6,800 | **Difficulty**: Advanced

#### Learning Objectives
1. Solve inverse kinematics for robot arms
2. Plan collision-free trajectories with MoveIt 2
3. Implement grasp planning algorithms
4. Use force control for compliant manipulation
5. Integrate vision (object detection) + manipulation

#### Section Outline

**9.1 Introduction: Manipulation Challenges**
- **Kinematics**: 7-DOF arm (redundant), IK has infinite solutions
- **Grasp stability**: Force closure, contact points
- **Deformable objects**: Cloth, food, soft materials

**9.2 Forward/Inverse Kinematics**
- **DH parameters**: Denavit-Hartenberg convention
- **Numerical IK**: Jacobian pseudoinverse, damped least squares
- **Code Example 1**: IK for 7-DOF arm (PyKDL library)

**9.3 MoveIt 2**
- **Motion planning**: RRT, RRT*, OMPL library
- **Collision checking**: FCL (Flexible Collision Library)
- **Code Example 2**: Plan trajectory from current pose to goal pose
```python
import moveit_commander

arm = moveit_commander.MoveGroupCommander("manipulator")
arm.set_pose_target([0.5, 0.2, 0.3, 0, 0, 0, 1])  # x,y,z, quat
plan = arm.plan()
arm.execute(plan)
```

**9.4 Grasp Planning**
- **Parallel-jaw gripper**: Approach direction, grasp width
- **Antipodal grasps**: Force closure condition
- **Code Example 3**: Sample grasp poses for cylinder (GPD library)

**9.5 GraspNet / Contact-GraspNet**
- **Learning-based**: DNN predicts grasp poses from point cloud
- **Training data**: Synthetic grasps in Isaac Sim
- **Code Example 4**: Infer grasps from RealSense depth image

**9.6 Force Control**
- **Admittance control**: Respond to contact forces
- **Use case**: Inserting peg in hole, wiping table
- **Code Example 5**: Implement admittance controller

**9.7 Visual Servoing**
- **Eye-in-hand**: Camera on end-effector
- **PBVS (Position-Based)**: Estimate object pose → move to goal
- **Code Example 6**: Visual servoing to grasp detected object

**9.8 Dual-Arm Manipulation**
- **Coordination**: Both arms work together
- **Use case**: Carry large box, open jar (one hand holds, one unscrews)
- **Code Example 7**: Coordinate two MoveIt groups

**9.9 Whole-Body Manipulation**
- **Mobile manipulator**: Use base + arms (redundancy)
- **Code Example 8**: Reach high shelf (stand on toes + extend arm)

#### Exercises

**Exercise 9.1**: Implement IK, compare 5 IK solvers (speed, success rate)

**Exercise 9.2**: Use MoveIt to stack 3 blocks, measure success rate

**Exercise 9.3**: Train GraspNet on YCB dataset, test on 10 novel objects

#### Citations (12 total)
1. Salisbury, J. K., & Roth, B. (1983). *Kinematic and force analysis of articulated mechanical hands.* Journal of Mechanisms.
2. Chitta, S., et al. (2012). *MoveIt! [ROS Topics].* IEEE RAM.

#### Hardware Requirements
- **Simulation**: Any PC (MoveIt works in Gazebo/RViz)
- **Real robot**: Franka Emika Panda ($25k) OR Unitree Z1 arm ($3k)

#### Lab
- **lab-09-1-moveit-planning**: Pick-and-place with MoveIt 2
- **lab-09-2-grasp-planning**: GraspNet inference, execute grasps in sim

---

### Chapter 10: Vision-Language-Action (VLA) Models
**Week**: 13 | **Word Count**: 8,500 | **Difficulty**: Advanced

#### Learning Objectives
1. Understand Vision-Language-Action model architecture
2. Implement voice interfaces with OpenAI Whisper
3. Use LLMs to plan robot actions (natural language → ROS)
4. Deploy RT-2 / OpenVLA for robotic control
5. Build end-to-end voice-controlled robot

#### Section Outline

**10.1 Introduction: From Chatbots to Robots**
- **LLMs**: GPT-4, Claude excel at text reasoning
- **VLAs**: Extend LLMs to control robots (input: image + text, output: actions)
- **Key papers**: RT-1 (Google, 2022), RT-2 (Google, 2023), OpenVLA (2024)

**10.2 VLA Architecture**
- **Vision encoder**: ViT (Vision Transformer) processes camera images
- **Language encoder**: LLM processes instructions ("pick up the cup")
- **Action decoder**: Predict robot actions (joint positions, gripper open/close)
- **Diagram**: RT-2 architecture

**10.3 Voice-to-Text (OpenAI Whisper)**
- **Speech recognition**: Audio → text transcription
- **Code Example 1**: Record voice, transcribe with Whisper
```python
import whisper

model = whisper.load_model("base")
result = model.transcribe("audio.mp3")
print(result["text"])
# Output: "Robot, pick up the red block"
```

**10.4 Language-to-Action Planning (GPT-4)**
- **Prompt engineering**: Give LLM robot capabilities
- **Code Example 2**: GPT-4 plans action sequence
```python
import openai

prompt = """
You are a robot controller. Available actions:
- navigate_to(location)
- grasp_object(object_name)
- place_object(location)

User command: "Bring me a water bottle from the kitchen"
Output a JSON list of actions.
"""

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[{"role": "user", "content": prompt}]
)

actions = json.loads(response.choices[0].message.content)
# [{"action": "navigate_to", "location": "kitchen"},
#  {"action": "grasp_object", "object": "water bottle"},
#  {"action": "navigate_to", "location": "user"}]
```

**10.5 Executing Actions with ROS 2**
- **Action bridge**: Convert LLM output → ROS action calls
- **Code Example 3**: Execute action sequence via Nav2 + MoveIt

**10.6 RT-2: Vision-Language-Action Model**
- **Training data**: Web images + robotic demonstrations
- **Transfer learning**: Use web knowledge (never seen scissors, but knows "cutting tool")
- **Code Example 4**: Run RT-2 inference (requires TPU/GPU cluster)

**10.7 OpenVLA (Open-Source Alternative)**
- **Model**: 7B parameters, trained on Open X-Embodiment dataset
- **Deployment**: Runs on NVIDIA Jetson Orin
- **Code Example 5**: Deploy OpenVLA to Unitree G1
```python
from openvla import OpenVLA

model = OpenVLA.load("openvla-7b")
image = camera.capture()  # RGB image
instruction = "pick up the cup"

action = model.predict(image, instruction)
robot.execute(action)  # [x, y, z, roll, pitch, yaw, gripper]
```

**10.8 Multi-Modal Interaction**
- **Speech + Gesture**: "Pick up that" (points at object)
- **Vision + Language**: "Grasp the red object" (requires object detection)
- **Code Example 6**: Combine Whisper + YOLO + GPT-4

**10.9 Error Recovery**
- **Failure detection**: If grasp fails, LLM replans
- **Code Example 7**: Retry logic with GPT-4 feedback

**10.10 Safety and Alignment**
- **Challenges**: LLM hallucinates, outputs unsafe actions
- **Mitigations**: Action bounds, human-in-the-loop confirmation
- **Code Example 8**: Filter LLM actions through safety checker

#### Exercises

**Exercise 10.1**: Implement voice interface (Whisper + TTS feedback)

**Exercise 10.2**: Use GPT-4 to plan multi-step task, execute in Gazebo

**Exercise 10.3**: Fine-tune OpenVLA on custom task (10 demonstrations)

#### Citations (20 total)
1. Brohan, A., et al. (2023). *RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control.* CoRL 2023.
2. Radford, A., et al. (2023). *Robust Speech Recognition via Large-Scale Weak Supervision (Whisper).* ICML 2023.

#### Hardware Requirements
- **Whisper**: Any PC (CPU-only works, slow but functional)
- **GPT-4 API**: Internet connection, OpenAI API key (~$0.03 per request)
- **OpenVLA**: NVIDIA Jetson Orin (16GB VRAM) OR RTX 4090

#### Lab
- **lab-10-1-voice-control**: Whisper → GPT-4 → ROS actions (pick-and-place)

---

### Chapter 11: Capstone Project
**Week**: 13 | **Word Count**: 5,000 | **Difficulty**: Capstone

#### Learning Objectives
1. Integrate all course modules (ROS 2, Gazebo, Isaac, VLA)
2. Design and implement a complete autonomous system
3. Evaluate performance with quantitative metrics
4. Present results professionally

#### Project Specification

**Title**: Voice-Controlled Autonomous Humanoid

**Scenario**: A simulated Unitree G1 humanoid receives a voice command from a human, plans a sequence of actions, navigates to a table, identifies an object using vision, grasps it, and brings it to the user.

**System Components**:
1. **Voice Interface** (Whisper): Transcribe user command
2. **Task Planning** (GPT-4): Decompose command into ROS actions
3. **Navigation** (Nav2 + Isaac VSLAM): Navigate to table
4. **Perception** (YOLO + FoundationPose): Detect and localize object
5. **Manipulation** (MoveIt 2): Grasp object
6. **Execution**: Deliver to user

**Example Commands**:
- "Robot, bring me the red cup from the table"
- "Clean the table by moving all objects to the bin"
- "Find the remote control and hand it to me"

#### Deliverables

**1. System Design Document** (10 pages)
- Architecture diagram (all nodes, topics, actions)
- Failure modes and mitigations
- Performance targets (latency, success rate)

**2. Implementation** (Code + Docker)
- All ROS 2 packages
- Launch files for full system
- Dockerized for reproducibility

**3. Evaluation** (Quantitative)
- **Metrics**:
  - Success rate (20 trials, varied commands)
  - Time to completion
  - Navigation accuracy (< 10cm error)
  - Grasp success rate
- **Report**: Tables, graphs, statistical analysis

**4. Video Demonstration** (3-5 minutes)
- Show 3 successful runs (different commands)
- Narrate system behavior
- Discuss one failure case + proposed fix

**5. Presentation** (10 minutes)
- Slides covering motivation, approach, results, lessons learned

#### Grading Rubric (100 points)

| **Category** | **Points** | **Criteria** |
|--------------|-----------|--------------|
| System Design | 20 | Clear architecture, justified design choices |
| Implementation Quality | 25 | Clean code, ROS best practices, Dockerized |
| Functionality | 30 | System works (≥70% success rate on test set) |
| Evaluation | 15 | Rigorous metrics, statistical analysis |
| Presentation | 10 | Clear communication, polished video |

#### Starter Code

**Provided**:
- ROS 2 package template
- Gazebo world with table + objects
- URDF for Unitree G1
- Sample voice commands dataset

**You Implement**:
- Voice → Action planner
- Navigation + Obstacle avoidance
- Vision → Grasp pipeline
- Full integration

#### Timeline

- **Week 13, Day 1-2**: Design document
- **Week 13, Day 3-5**: Implementation
- **Week 13, Day 6**: Evaluation + Video
- **Week 13, Day 7**: Presentation

#### Example Projects (Inspiration)

1. **"Coffee Fetch"**: Robot navigates kitchen, identifies coffee mug via vision, grasps, delivers to user
2. **"Table Cleanup"**: Robot detects scattered objects, plans order to move them to bin, executes
3. **"Tool Handover"**: User asks for screwdriver, robot searches workshop, identifies tool, hands it over

#### Tips for Success

- **Start simple**: Get teleoperation working first, then add autonomy
- **Test incrementally**: Test each module (Whisper, Nav2, MoveIt) in isolation before integration
- **Use simulation**: Debug in Gazebo/Isaac before deploying to real robot (if available)
- **Failure analysis**: Every failure teaches you something—document and fix

---

## Part 5: Hardware, Ethics, and Future
**Post-Quarter Reference** | **Chapters**: 12-13

---

### Chapter 12: Hardware Guide
**Reference** | **Word Count**: 9,000 | **Difficulty**: All Levels

#### Learning Objectives
1. Choose appropriate hardware for your goals and budget
2. Build a workstation optimized for robotics simulation
3. Set up NVIDIA Jetson for edge AI deployment
4. Configure RealSense cameras, LIDAR, IMUs
5. Compare cloud vs on-premise infrastructure

#### Section Outline

**12.1 Introduction: Investment Tiers**
- **Tier 1**: Cloud-Only ($205/quarter + $1,118 one-time)
- **Tier 2**: Budget Workstation + Edge Kit ($3,500 one-time)
- **Tier 3**: Premium Research Lab ($15,000+)

**12.2 Tier 1: Cloud-Only Setup**
- **AWS g5.2xlarge**: A10G GPU (24GB VRAM), 8 vCPU, 32 GB RAM
- **Workflow**: Train in cloud, deploy to local Jetson
- **Cost analysis**: $1.50/hour × 120 hours = $180/quarter
- **Code Example 1**: Launch EC2 instance, install Isaac Sim

**12.3 Tier 2: Budget Workstation Build**
- **Part list** (exact models, prices, vendor links):
  - GPU: NVIDIA RTX 4070 Ti 12GB ($800 - Newegg)
  - CPU: Intel Core i7-13700K ($400 - Amazon)
  - RAM: Corsair Vengeance DDR5 32GB ($120 - Amazon)
  - SSD: Samsung 980 Pro 1TB NVMe ($80 - Amazon)
  - Motherboard: ASUS TUF Z790 ($220 - Newegg)
  - PSU: EVGA 850W Gold ($100 - Amazon)
  - Case: NZXT H510 ($80 - Amazon)
- **Total**: $1,800
- **Build guide**: Step-by-step assembly photos

**12.4 Tier 3: Premium Lab (RTX 4090 + Unitree G1)**
- **Workstation**: RTX 4090 24GB, AMD Ryzen 9 7950X, 64GB RAM ($3,500)
- **Robot**: Unitree G1 Humanoid ($16,000)
- **Sensors**: RealSense L515 LIDAR ($950), Force/torque sensors ($2,500)

**12.5 NVIDIA Jetson Ecosystem**
- **Jetson Orin Nano Super**: 8GB, 40 TOPS, $249 (NEW 2024 price drop!)
- **Jetson Orin NX**: 16GB, 100 TOPS, $599
- **Jetson AGX Orin**: 64GB, 275 TOPS, $1,999
- **Comparison table**: TOPS, memory, power, use case

**12.6 Jetson Setup (Windows → Jetson Workflow)**
<details>
<summary>Flash JetPack from Windows</summary>

**On Windows 10/11**:
1. Download NVIDIA SDK Manager (Windows version)
2. Connect Jetson via USB-C (force recovery mode)
3. Flash JetPack 5.1.2 (Ubuntu 20.04 + ROS 2 Humble)
4. SSH into Jetson: `ssh nvidia@192.168.55.1`

</details>

**12.7 Intel RealSense D435i**
- **Specs**: Stereo depth (640×480 @ 90fps), RGB (1920×1080 @ 30fps), IMU
- **Use case**: VSLAM, object detection, obstacle avoidance
- **Code Example 2**: RealSense + Jetson + Isaac ROS VSLAM

**12.8 LIDAR Options**
- **RPLIDAR A1**: 2D, 12m range, $99 (budget)
- **Livox Mid-360**: 3D, 70m range, $599 (mid-tier)
- **Velodyne VLP-16**: 3D, 100m range, $4,000 (premium)

**12.9 IMU Selection**
- **MPU6050**: $2 (hobby projects)
- **BNO055**: $20 (sensor fusion built-in)
- **VectorNav VN-100**: $750 (GPS + IMU, research-grade)

**12.10 Robot Platforms**
- **Unitree Go2 Edu**: Quadruped, $2,500 (best proxy for humanoid)
- **Unitree G1**: Humanoid, $16,000 (most affordable research humanoid)
- **TurtleBot4**: Wheeled, $1,200 (ROS 2 education platform)

**12.11 Power Budget**
- **Workstation**: RTX 4070 Ti (285W) + CPU (125W) = ~450W total
- **Jetson Orin Nano**: 7-15W (incredibly efficient!)
- **Robot**: Unitree G1 battery (2 hours runtime)

**12.12 Cloud vs On-Premise: TCO Analysis**
- **3-year total cost** (simulation workload: 10 hours/week):
  - Cloud: $180/quarter × 12 quarters = $2,160
  - On-premise: $1,800 (workstation) + $50/year (electricity) = $1,950
- **Breakeven**: ~10 quarters (2.5 years)

**12.13 Recommended Setups by Role**

**Undergraduate Student**:
- **Option A**: GitHub Codespaces (free 60 hours/month) + Jetson Orin Nano ($249)
- **Option B**: Budget workstation ($1,800) if planning multi-year use

**Graduate Researcher**:
- **Budget workstation** ($1,800) + **Jetson Orin NX** ($599) + **RealSense D435i** ($349)
- **Total**: $2,748

**Industry Lab**:
- **Premium workstation** ($3,500) + **Unitree G1** ($16,000) + **Full sensor suite** ($1,500)
- **Total**: $21,000

#### Appendices

**Appendix A**: Part links (PCPartPicker lists)
**Appendix B**: Troubleshooting (GPU not detected, CUDA errors)
**Appendix C**: Vendor contacts (Unitree, NVIDIA, Intel RealSense)

#### Citations (8 total)
1. NVIDIA. (2024). *Jetson Orin Modules and Developer Kits.* https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/
2. Intel. (2023). *RealSense D400 Series Datasheet.* https://www.intelrealsense.com/

---

### Chapter 13: Ethics & Future of Physical AI
**Reference** | **Word Count**: 6,000 | **Difficulty**: All Levels

#### Learning Objectives
1. Identify ethical challenges in embodied AI (safety, bias, job displacement)
2. Understand AI safety principles for physical systems
3. Analyze societal impact of humanoid robots
4. Predict future directions of Physical AI research

#### Section Outline

**13.1 Introduction: When AI Enters the World**
- **Digital AI**: Errors are annoying (wrong answer, offensive output)
- **Physical AI**: Errors are dangerous (robot collision, wrong medication)
- **Stakes**: Human safety, property damage, legal liability

**13.2 Safety: The Asimov Problem**
- **Three Laws of Robotics** (Asimov, 1942): Don't harm humans, obey orders (unless harm), self-preservation
- **Reality**: Vague, unenforceable, impossible to formalize
- **Modern approach**: Robust control, fail-safes, human-in-the-loop

**13.3 Physical Safety**
- **Collision avoidance**: Humans are unpredictable, must have safety margins
- **Emergency stop**: Hardware kill switch (required by ISO 10218)
- **Force limits**: Collaborative robots (cobots) must limit contact force (less than 150N)
- **Case study**: Tesla autopilot crashes, lessons learned

**13.4 Bias in Embodied AI**
- **Training data**: If VLA trained on data from wealthy homes, may fail in low-income settings
- **Example**: Hand soap dispenser that doesn't detect dark skin (optical sensor bias)
- **Mitigation**: Diverse training data, fairness audits

**13.5 Privacy & Surveillance**
- **Robots with cameras**: Constant recording in homes, workplaces
- **Data ownership**: Who owns video of you in a restaurant where a robot works?
- **Regulation**: GDPR (EU), CCPA (California) implications

**13.6 Job Displacement**
- **Warehouse automation**: Amazon replacing pickers with robots
- **Food service**: Flippy (burger-flipping robot), autonomous delivery
- **Prediction**: 85 million jobs displaced by 2025 (World Economic Forum)
- **Counterargument**: 97 million new jobs created (robot maintenance, AI training)

**13.7 Dual-Use Concerns**
- **Military applications**: Boston Dynamics Spot with gun mount (controversy)
- **Autonomous weapons**: Loitering munitions, drone swarms
- **Treaties**: Campaign to Stop Killer Robots

**13.8 Alignment: What Do We Want Robots to Do?**
- **Value alignment**: Whose values? Cultural differences (individualism vs collectivism)
- **Example**: Should a robot lie to protect feelings?

**13.9 Regulation & Standards**
- **ISO 10218**: Safety requirements for industrial robots
- **IEEE 7000**: Ethical considerations in system design
- **EU AI Act**: High-risk AI systems (including robots) require audits

**13.10 Future: Next 10 Years**
- **2025-2030**: Humanoid robots in warehouses, factories (Agility Digit, Figure 01)
- **2030-2035**: Home assistants (elderly care, cleaning)
- **2035+**: Human-level dexterity, conversational intelligence

**13.11 Research Frontiers**
- **Soft robotics**: Compliant, safe for human interaction
- **Morphological computation**: Body design as part of intelligence
- **Lifelong learning**: Robots that continuously improve from experience

**13.12 Call to Action**
- **Build responsibly**: Prioritize safety, transparency, fairness
- **Engage with policy**: Researchers should inform regulation
- **Interdisciplinary work**: Collaborate with ethicists, social scientists, lawyers

#### Discussion Questions

1. Should humanoid robots be anthropomorphic (human-like) or clearly robotic? (Trust, uncanny valley)
2. Who is liable when a robot causes harm? (Manufacturer, operator, robot itself?)
3. Should there be limits on robot capabilities? (e.g., ban autonomous weapons)

#### Citations (15 total)
1. Asimov, I. (1950). *I, Robot.* Gnome Press.
2. Calo, R. (2015). *Robotics and the Lessons of Cyberlaw.* California Law Review.
3. World Economic Forum. (2020). *The Future of Jobs Report 2020.* https://www.weforum.org/

---

**End of Outlines Document**

**Total Word Count** (estimated): 90,000 - 95,000 words across 12 chapters

**Next Step**: Review these outlines, suggest changes, approve for full chapter creation.
