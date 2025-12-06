# Physical AI & Humanoid Robotics

![Physical AI & Humanoid Robotics](images/book-cover-image.jpeg)

> **A comprehensive textbook for building intelligent robots that understand and act in the physical world**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chapters](https://img.shields.io/badge/Chapters-14-green.svg)](docs/)
[![Word Count](https://img.shields.io/badge/Words-90K-orange.svg)](docs/)
[![Labs](https://img.shields.io/badge/Labs-40+-purple.svg)](https://github.com/Shumailaaijaz/physical-ai-labs)

---

## 📖 About This Textbook

This **open-source textbook** provides a complete **13-week university curriculum** for Physical AI and Humanoid Robotics. Designed for advanced undergraduates, graduate students, and industry practitioners, it covers everything from ROS 2 fundamentals to vision-language-action models for autonomous humanoid robots.

### What Makes This Textbook Unique?

✅ **Windows-First Approach** - Runs on Windows 10/11 + Docker (no Linux required)  
✅ **Three Hardware Tiers** - Cloud-only ($205/quarter), Budget ($3,500), Research ($20,000+)  
✅ **Real-World Focus** - Uses Unitree G1/Go2 humanoids, NVIDIA Isaac Sim, ROS 2  
✅ **150+ Code Examples** - Every concept backed by working Python/C++ implementations  
✅ **40+ Hands-On Labs** - Practical exercises with Docker/Codespaces support  
✅ **Complete Open Source** - MIT licensed, community-driven  

---

## 📚 Table of Contents

### **Part 1: Foundations** (Weeks 1-2)

- **[Chapter 0: Preface](docs/00-preface.mdx)** - Course overview, hardware requirements, setup
- **[Chapter 1: Introduction to Physical AI](docs/01-introduction-to-physical-ai.mdx)** - From digital AI to embodied intelligence

### **Part 2: The Robotic Nervous System** (Weeks 3-7)

- **[Chapter 2: ROS 2 Fundamentals](docs/02-ros2-fundamentals.mdx)** (8,000 words)
- **[Chapter 3: URDF & Robot Modeling](docs/03-urdf-robot-modeling.mdx)** (7,000 words)
- **[Chapter 4: Gazebo Simulation](docs/04-gazebo-simulation.mdx)** (7,500 words)
- **[Chapter 5: Unity Robotics Hub](docs/05-unity-robotics-hub.mdx)** (6,500 words)

### **Part 3: The AI-Robot Brain** (Weeks 8-10)

- **[Chapter 6: NVIDIA Isaac Sim Basics](docs/06-isaac-sim-basics.mdx)** (8,000 words)
- **[Chapter 7: Isaac ROS Integration](docs/07-isaac-ros-integration.mdx)** (7,500 words)

### **Part 4: Humanoid Control & Intelligence** (Weeks 11-13)

- **[Chapter 8: Legged Locomotion](docs/08-legged-locomotion.mdx)** (7,000 words)
- **[Chapter 9: Manipulation & Grasping](docs/09-manipulation-grasping.mdx)** (6,800 words)
- **[Chapter 10: Vision-Language-Action Models](docs/10-vision-language-action.mdx)** (8,500 words)
- **[Chapter 11: Capstone Project](docs/11-capstone-project.mdx)** (5,000 words)

### **Part 5: Hardware, Ethics & Future** (Reference)

- **[Chapter 12: Hardware Guide](docs/12-hardware-guide.mdx)** (9,000 words)
- **[Chapter 13: Ethics & Future of Physical AI](docs/13-ethics-future-physical-ai.mdx)** (6,000 words)

---

## 🎯 Learning Outcomes

By completing this textbook, you will be able to:

1. **Build ROS 2 systems** - Design distributed robot architectures
2. **Simulate robots** - Create physics-accurate simulations
3. **Deploy AI on edge** - Port code to NVIDIA Jetson
4. **Control humanoid robots** - Implement locomotion and manipulation
5. **Integrate VLA models** - Use LLMs for robot control

---

## 💻 Hardware Requirements

### **Tier 1: Cloud-Only** ($205/quarter)
- AWS g5.2xlarge + NVIDIA Jetson Orin Nano + RealSense D435i

### **Tier 2: Budget Workstation** ($3,500 one-time)
- RTX 4070 Ti, i7 13th Gen, 32GB RAM, Jetson + sensors

### **Tier 3: Research Lab** ($20,000+)
- RTX 4090, Unitree G1 Humanoid, advanced sensors

**See [Chapter 12](docs/12-hardware-guide.mdx) for detailed build guides.**

---

## 🚀 Quick Start

### Windows 10/11 + Docker

\`\`\`powershell
# Install Docker Desktop
# Pull ROS 2 Humble image
docker pull osrf/ros:humble-desktop

# Run container
docker run -it --name ros2_dev osrf/ros:humble-desktop
ros2 --version
\`\`\`

### GitHub Codespaces

Click "Code" → "Codespaces" → "Create codespace" - Pre-configured environment ready!

---

## 🧪 Companion Labs

🔗 **[Physical AI Labs Repository](https://github.com/Shumailaaijaz/physical-ai-labs)**

- 40+ ROS 2 packages
- Gazebo/Isaac Sim scenes
- Docker configurations
- Codespaces support

---

## 📅 13-Week Course Schedule

| Week | Module | Topics | Chapters |
|------|--------|--------|----------|
| 1-2 | Foundations | Physical AI, sensors | 0-1 |
| 3-5 | ROS 2 | Nodes, topics, URDF | 2-3 |
| 6-7 | Simulation | Gazebo, Unity | 4-5 |
| 8-10 | Isaac | Isaac Sim, SLAM, Nav2 | 6-7 |
| 11-12 | Humanoid | Locomotion, manipulation | 8-9 |
| 13 | VLA | Voice control, capstone | 10-11 |

---

## 🤝 Contributing

We welcome contributions!

1. Report bugs - [Open an issue](https://github.com/Shumailaaijaz/physical-ai-textbook/issues)
2. Fix errors - Submit a PR
3. Share - Star ⭐ the repo

---

## 📄 License

MIT License - Free to use for teaching and research.

**Attribution:** *Physical AI & Humanoid Robotics Textbook by Shumaila Aijaz*

---

## 📞 Contact

- [GitHub Discussions](https://github.com/Shumailaaijaz/physical-ai-textbook/discussions)
- [Issues](https://github.com/Shumailaaijaz/physical-ai-textbook/issues)

---

## 🚀 Start Learning

Ready to build your first robot? Start with **[Chapter 0: Preface](docs/00-preface.mdx)**

---

<p align="center">
  <strong>Built with ❤️ by the Physical AI community</strong><br>
  <a href="https://github.com/Shumailaaijaz/physical-ai-textbook/stargazers">⭐ Star</a> •
  <a href="https://github.com/Shumailaaijaz/physical-ai-labs">🧪 Labs</a> •
  <a href="https://github.com/Shumailaaijaz/physical-ai-textbook/discussions">💬 Discuss</a>
</p>
