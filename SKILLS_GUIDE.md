# Skills System Guide

The Physical AI Textbook includes an intelligent skills system that provides reusable AI-powered capabilities for content enhancement, translation, and diagram generation.

## Overview

**Skills** are modular, reusable AI functions that enhance the learning experience:

1. **Urdu Translation** - Translate chapters to Urdu while preserving technical terms
2. **Diagram Generator** - Create technical diagrams using Mermaid.js
3. **Code Generator** - Generate ROS 2, Python, and robotics code examples

---

## Skill 1: Urdu Translation

### Purpose
Translates English technical content to Urdu while intelligently preserving technical terminology.

### Features
- ✅ Natural Urdu translation
- ✅ Preserves all technical terms (ROS 2, Python, URDF, etc.)
- ✅ Maintains markdown formatting
- ✅ 24-hour caching for performance
- ✅ Per-chapter translation

### Configuration

**File**: `skills/urdu-translate.yaml`

```yaml
skill: urdu-translate
version: 1.0.0
prompt: |
  Translate to Urdu, preserving technical terms...

output_format: JSON
cache_duration: 86400  # 24 hours
model: gpt-4-turbo
```

### Usage

**In Chapter MDX Files:**

```mdx
import UrduTranslate from '@site/src/components/UrduTranslate';

# Chapter 2: ROS 2 Fundamentals

<UrduTranslate chapterId="02-ros2-fundamentals" chapterTitle="ROS 2 Fundamentals" />

... rest of chapter content ...
```

**API Endpoint:**

```bash
POST /api/v1/translate/urdu
Content-Type: application/json

{
  "text": "ROS 2 is a robotics framework..."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "original": "ROS 2 is a robotics framework...",
    "urdu": "ROS 2 ایک robotics framework ہے...",
    "technical_terms": ["ROS 2", "robotics", "framework"]
  }
}
```

### Technical Terms Preserved

- ROS 2, URDF, Gazebo, Unity, Isaac Sim
- Python, JavaScript, TypeScript
- Docker, WSL2, Ubuntu, Windows
- API, JSON, YAML, XML
- File extensions (.py, .ts, .js, .mdx)

---

## Skill 2: Diagram Generator

### Purpose
Creates professional technical diagrams using Mermaid.js syntax.

### Features
- ✅ Flowcharts, sequence diagrams, state machines
- ✅ Automatic color coding
- ✅ Professional styling
- ✅ Responsive and interactive
- ✅ SVG export

### Configuration

**File**: `skills/diagram-gen.yaml`

```yaml
skill: diagram-gen
version: 1.0.0
output_format: mermaid
model: gpt-4-turbo
```

### Usage in MDX

**Simple Diagram:**

\`\`\`mermaid
graph LR
  A[Publisher] -->|/cmd_vel| B[Topic]
  B --> C[Subscriber]
  style A fill:#4CAF50
  style C fill:#2196F3
\`\`\`

**ROS 2 Architecture:**

\`\`\`mermaid
graph TD
  A[High-Level Planner] --> B[Motion Controller]
  B --> C[Left Leg Controller]
  B --> D[Right Leg Controller]
  B --> E[Arm Controller]
  F[Sensors] --> G[State Estimator]
  G --> A

  style A fill:#E91E63
  style B fill:#9C27B0
  style F fill:#FF5722
\`\`\`

### Example Diagrams

#### **Chapter 2: ROS 2 Communication**

\`\`\`mermaid
sequenceDiagram
  participant P as Publisher
  participant T as Topic (/cmd_vel)
  participant S as Subscriber

  P->>T: Publish Twist message
  T->>S: Deliver message
  S->>S: Process velocity
  Note over S: Update robot motion
\`\`\`

#### **Chapter 8: Locomotion State Machine**

\`\`\`mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Standing: Power On
  Standing --> Walking: Start Command
  Walking --> Running: Speed > 1.5 m/s
  Running --> Walking: Speed < 1.5 m/s
  Walking --> Standing: Stop Command
  Standing --> Idle: Power Off
\`\`\`

---

## Skill 3: Code Generator

### Purpose
Generates robotics code examples for various platforms and languages.

### Features
- ✅ ROS 2 (Python & C++)
- ✅ Hardware-agnostic
- ✅ Windows 10/11 + WSL2 compatible
- ✅ Well-commented and documented

### Usage

**Generate ROS 2 Node:**

```bash
/sp.skill code-gen --type ros2-node --language python --description "Joint state publisher for humanoid robot"
```

**Output:**

```python
#!/usr/bin/env python3
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState

class HumanoidJointPublisher(Node):
    def __init__(self):
        super().__init__('humanoid_joint_publisher')
        self.publisher_ = self.create_publisher(JointState, 'joint_states', 10)
        self.timer = self.create_timer(0.01, self.publish_joints)  # 100Hz
        self.get_logger().info('Humanoid Joint Publisher started')

    def publish_joints(self):
        msg = JointState()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.name = ['left_hip', 'left_knee', 'left_ankle',
                    'right_hip', 'right_knee', 'right_ankle']
        msg.position = [0.0] * 6
        msg.velocity = [0.0] * 6
        msg.effort = [0.0] * 6
        self.publisher_.publish(msg)

def main(args=None):
    rclpy.init(args=args)
    node = HumanoidJointPublisher()
    rclpy.spin(node)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

---

## Integration with /sp Commands

### /sp.implement

Use skills during implementation:

```bash
# Translate chapter after writing
/sp.implement chapter-2 --with-skill urdu-translate

# Generate diagrams
/sp.skill diagram-gen --desc "ROS 2 node graph for humanoid" --output static/img/ros-diagram.svg

# Generate code examples
/sp.skill code-gen --type ros2-subscriber --topic /cmd_vel
```

### /sp.subagent

Skills can be called by subagents:

```bash
# ROS generator subagent uses diagram skill
/sp.subagent ros-generator --prompt "Create publisher-subscriber example with diagram"
```

---

## Backend API Routes

All skills are accessible via REST API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/translate/urdu` | POST | Translate text to Urdu |
| `/api/v1/translate/languages` | GET | List supported languages |
| `/api/v1/diagrams/generate` | POST | Generate Mermaid diagram |
| `/api/v1/code/generate` | POST | Generate code examples |

---

## Caching Strategy

**Translation Cache:**
- Duration: 24 hours
- Storage: Memory (production: Redis)
- Key: MD5 hash of input text

**Diagram Cache:**
- Duration: 7 days
- Storage: File system
- Format: SVG

**Performance:**
- First load: ~2-3 seconds (API call)
- Cached: <50ms

---

## Adding New Skills

### 1. Create Skill Definition

**File**: `skills/my-skill.yaml`

```yaml
skill: my-skill
version: 1.0.0
description: What this skill does

prompt: |
  Your AI prompt here with {placeholders}

output_format: JSON | mermaid | code
model: gpt-4-turbo

examples:
  - input: "Example input"
    output: "Example output"
```

### 2. Implement Skill Logic

**File**: `server/src/skills/my-skill.ts`

```typescript
export async function mySkill(input: string): Promise<any> {
  // Implement skill logic
  // Call AI API, process data, return result
}
```

### 3. Add API Route

**File**: `server/src/api/my-skill.ts`

```typescript
import express from 'express';
import { mySkill } from '../skills/my-skill';

const router = express.Router();

router.post('/', async (req, res) => {
  const result = await mySkill(req.body.input);
  res.json({ success: true, data: result });
});

export default router;
```

### 4. Register Route

**File**: `server/src/routes/api.ts`

```typescript
import mySkillRouter from '../api/my-skill';
router.use('/my-skill', mySkillRouter);
```

---

## Production Deployment

### Environment Variables

```env
# AI API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Caching
REDIS_URL=redis://localhost:6379
CACHE_DURATION=86400

# Rate Limiting
TRANSLATION_RATE_LIMIT=100  # per hour
```

### Vercel Functions

Deploy skills as serverless functions:

```javascript
// api/translate.js
export default async function handler(req, res) {
  const { text } = req.body;
  const result = await translateToUrdu(text);
  res.json(result);
}
```

---

## Examples in Chapters

### Chapter 2: ROS 2 Fundamentals

```mdx
import UrduTranslate from '@site/src/components/UrduTranslate';

# ROS 2 Fundamentals

<UrduTranslate chapterId="02-ros2-fundamentals" chapterTitle="ROS 2 Fundamentals" />

## Communication Architecture

\`\`\`mermaid
graph LR
  A[Publisher] -->|/cmd_vel| B[Topic]
  B --> C[Subscriber]
  D[Service Client] -->|Request| E[Service]
  E -->|Response| D
\`\`\`
```

---

## Troubleshooting

**Translation Not Working:**
1. Check API endpoint is running
2. Verify CORS settings
3. Check browser console for errors
4. Clear localStorage cache

**Diagrams Not Rendering:**
1. Ensure Mermaid theme installed
2. Validate Mermaid syntax
3. Check docusaurus.config.ts has mermaid: true

**Slow Performance:**
1. Check cache is enabled
2. Monitor API response times
3. Consider Redis for production

---

## Roadmap

**Future Skills:**
- Arabic translation
- Interactive 3D model viewer
- Live code execution sandbox
- Video transcript generation
- Quiz/exercise generator

---

**Version**: 1.0.0
**Last Updated**: 2025-12-06
